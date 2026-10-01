import type { Request, Response } from "express";
import { getUserId } from "../workflows/workflow.controller";
import { startWorkflowExecution } from "./execution.service";

export const executeWorkflowController = async (
  req: Request,
  res: Response,
) => {
  try {
    //  POST /workflows/:id/execute
    // get workflow id from the url of post request
    const workflowId = req.params.id;

    if (!workflowId || Array.isArray(workflowId)) {
      return res.status(400).json({
        message: "Invalid workflow ID",
      });
    }
    const userId = getUserId(req);

    const result = await startWorkflowExecution(workflowId, userId);

    return res.status(202).json(result);
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to execute workflow",
    });
  }
};
