import { prisma } from "../lib/prisma";
import { workflowQueue } from "../queues/execution.queue";

export const startWorkflowExecution = async (
  workflowId: string,
  userId: string,
) => {
  // This prevents one user from executing
  // another user's workflow.
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  // Don't allow another execution if this workflow is already running.
  if (workflow.workflowStatus === "ONGOING") {
    throw new Error("Workflow is already running");
  }

  // Put the execution request into BullMQ.
  //
  // The API request finishes quickly.
  // The worker will execute the workflow in the background.
  const job = await workflowQueue.add(
    "execute-workflow",
    {
      workflowId,
      userId,
    },
    {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    },
  );

  return {
    message: "Workflow execution started",
    jobId: job.id,
    workflowId,
  };
};
