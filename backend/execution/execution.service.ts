import { prisma } from "../lib/prisma";
import { executeWorkflow } from "./execution.engine";
import { workflowQueue } from "../queues/execution.queue";
import { redis } from "../lib/redis";

export const NODE_CREDIT_COSTS: Record<string, number> = {
  INPUT_TRIGGER: 0,
  OUTPUT: 0,
  BROWSER_TRIGGER: 1,
  HTTP_TRIGGER: 0,
  WEBHOOK_TRIGGER: 0,
  CLAUDE_EXECUTER: 3,
  OPENAI_EXECUTER: 3,
  GEMINI_EXECUTER: 2,
  POSTGRES_EXECUTER: 2,
  EMAIL_EXECUTER: 1,
  SLACK_EXECUTER: 1,
  GOOGLE_FORM_EXECUTER: 1,
};

export const calculateWorkflowCredits = (
  nodes: Array<{ type: string; data?: any }>,
): number => {
  return nodes.reduce((sum, node) => {
    if (typeof (node.data as any)?.cost === "number") {
      return sum + (node.data as any).cost;
    }
    return sum + (NODE_CREDIT_COSTS[node.type] ?? 0);
  }, 0);
};

export const startWorkflowExecution = async (
  workflowId: string,
  userId: string,
) => {
  // Validate that workflow belongs to authenticated user and load its nodes
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId,
    },
    include: {
      nodes: true,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  // Calculate required credits based on marked credits per node
  const totalCredits = calculateWorkflowCredits(workflow.nodes);

  // Validate user has sufficient credits
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditBalance: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (totalCredits > 0 && user.creditBalance < totalCredits) {
    throw new Error(
      `Insufficient credits. This workflow requires ${totalCredits} credits, but you have ${user.creditBalance} available. Please add credits in Billing.`
    );
  }

  // Deduct credits and log in CreditLedger immediately upon execution start
  if (totalCredits > 0) {
    await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          creditBalance: {
            decrement: totalCredits,
          },
        },
      });

      await tx.creditLedger.create({
        data: {
          userId,
          type: "USAGE",
          amount: -totalCredits,
          balanceAfter: updatedUser.creditBalance,
          description: `Executed "${workflow.workflowName}" (${totalCredits} credits for ${workflow.nodes.length} nodes)`,
        },
      });
    });
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
      creditsConsumed: totalCredits,
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
    creditsConsumed: totalCredits,
    workflowId,
    status: "ONGOING",
  };
};

