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

  // Execute workflow engine asynchronously in the background so API responds instantly
  // Real-time progress is streamed via Socket.io
  (async () => {
    try {
      const results = await executeWorkflow(workflowId);
      await prisma.workflow.update({
        where: { id: workflowId },
        data: { workflowStatus: "COMPLETED" },
      });
      return results;
    } catch (err) {
      console.error(`Workflow ${workflowId} execution error:`, err);
      await prisma.workflow
        .update({
          where: { id: workflowId },
          data: { workflowStatus: "FAILED" },
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
    workflowId,
    status: "ONGOING",
  };
};

