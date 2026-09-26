import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as workflowService from "./workflow.service";

const getUserId = (req: Request) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new Error("Token not found");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

  return decoded.id;
};

// get workflows controller
export const getAllWorkflowsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = getUserId(req);

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const result = await workflowService.getAll(
      userId,
      page,
      limit,
      status,
      search,
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to fetch workflows",
    });
  }
};

// create workflow
export const createWorkflowController = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const { workflowName, workflowDescription } = req.body;

    if (!workflowName) {
      return res.status(400).json({
        message: "Workflow name is required",
      });
    }

    const workflow = await workflowService.create(
      userId,
      workflowName,
      workflowDescription,
    );

    return res.status(201).json({
      message: "Workflow created successfully",
      workflow,
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to create workflow",
    });
  }
};

// get workflow by Id
export const getWorkflowById = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const workflowId = req.params.id;

    if (!workflowId || Array.isArray(workflowId)) {
      return res.status(400).json({
        message: "Invalid workflow ID",
      });
    }
    const workflow = await workflowService.getbyId(userId, workflowId);

    return res.status(200).json({
      workflow,
    });
  } catch (error) {
    return res.status(404).json({
      message: error instanceof Error ? error.message : "Workflow not found",
    });
  }
};

// deleteWorkdlow

export const deleteWorkflow = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const workflowId = req.params.id;
    if (!workflowId || Array.isArray(workflowId)) {
      return res.status(400).json({
        message: "Invalid workflow ID",
      });
    }
    await workflowService.remove(workflowId, userId);
    return res.status(200).json({
      message: "Workflow deleted successfully",
    });
  } catch (error) {
    return res.status(404).json({
      message: error instanceof Error ? error.message : "Workflow not found",
    });
  }
};
