import { Worker } from "bullmq";
import { connection } from "./execution.queue";
import { prisma } from "../lib/prisma";
import { executeWorkflow } from "../execution/execution.engine";

// name of queue, hwo to process that queue, connection with redis in order to work with quque

const workflowWorker = new Worker(
  "workflow-execution",

  async (job) => {
    // get the workflow ID that service placed inside the job
    const { workflowId } = job.data;
    try {
      // make this workflow currently executing
      await prisma.workflow.update({
        where: { id: workflowId },
        data: {
          workflowStatus: "ONGOING",
        },
      });
      //  run the actal workflow executino engine
      const results = await executeWorkflow(workflowId);

      // mark Workflow completed
      await prisma.workflow.update({
        where: {
          id: workflowId,
        },
        data: {
          workflowStatus: "COMPLETED",
        },
      });
      return results;
    } catch (error) {
      await prisma.workflow.update({
        where: {
          id: workflowId,
        },
        data: {
          workflowStatus: "FAILED",
        },
      });
      // Re-throw so BullMQ knows the job failed.
      throw error;
    }
  },
  { connection },
);
