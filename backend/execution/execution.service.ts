import { prisma } from "../lib/prisma";
import { executeWorkflow } from "./execution.engine";
import { workflowQueue } from "../queues/execution.queue";
import { redis } from "../lib/redis";

export const startWorkflowExecution = async (
  workflowId: string,
  userId: string,
) => {
  // Validate that workflow belongs to authenticated user
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  // Mark workflow ONGOING immediately in DB
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { workflowStatus: "ONGOING" },
  });

  // Track execution run in WorkflowExecution table
  const startedAt = new Date();
  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId,
      userId,
      status: "ONGOING",
      startedAt,
    },
  });

  // Execute workflow engine asynchronously in the background so API responds instantly
  // Real-time progress is streamed via Socket.io
  (async () => {
    try {
      const results = await executeWorkflow(workflowId);

      // Persist results into each node's data so completed workflows display output results
      if (results && typeof results === "object") {
        for (const [nodeId, nodeResult] of Object.entries(results)) {
          try {
            const existingNode = await prisma.node.findUnique({ where: { id: nodeId } });
            if (existingNode) {
              const currentData = (existingNode.data as Record<string, any>) || {};
              await prisma.node.update({
                where: { id: nodeId },
                data: {
                  data: {
                    ...currentData,
                    outputData: nodeResult,
                    status: "success",
                  },
                },
              });
            }
          } catch (nodeErr) {
            console.warn(`Failed to persist node ${nodeId} execution result:`, nodeErr);
          }
        }
      }

      await prisma.workflow.update({
        where: { id: workflowId },
        data: { workflowStatus: "COMPLETED" },
      });

      const completedAt = new Date();
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: "COMPLETED",
          completedAt,
          durationMs: completedAt.getTime() - startedAt.getTime(),
        },
      });

      return results;
    } catch (err: any) {
      console.error(`Workflow ${workflowId} execution error:`, err);
      const completedAt = new Date();
      await prisma.workflow
        .update({
          where: { id: workflowId },
          data: { workflowStatus: "FAILED" },
        })
        .catch(() => {});

      await prisma.workflowExecution
        .update({
          where: { id: execution.id },
          data: {
            status: "FAILED",
            completedAt,
            durationMs: completedAt.getTime() - startedAt.getTime(),
            error: err instanceof Error ? err.message : String(err),
          },
        })
        .catch(() => {});
    }
  })();

  // Optional BullMQ enqueue (non-blocking, only if Redis is connected)
  let jobId = `job-${Date.now()}`;
  if (redis.status === "ready") {
    try {
      const job = await workflowQueue.add(
        "execute-workflow",
        { workflowId, userId },
        { attempts: 1 },
      );
      if (job?.id) {
        jobId = job.id;
      }
    } catch {
      // Non-fatal if Redis fails
    }
  }

  return {
    message: "Workflow execution started instantly",
    jobId,
    executionId: execution.id,
    workflowId,
    status: "ONGOING",
  };
};

