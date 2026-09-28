import type { Request, Response } from "express";
import { getUserId } from "../workflows/workflow.controller";
import * as workflowService from "./credentials.service";

export const getAllCredentialsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        message: "User Not found",
      });
    }

    const credentials = await workflowService.getAll(userId);

    return res.status(200).json({
      message: "Credentials fetched successfully",
      credentials,
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to fetch credentials",
    });
  }
};

export const savecredentialsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        message: "User Not found",
      });
    }

    const { type, name, value } = req.body;

    const credential = await workflowService.save(userId, type, name, value);

    return res.status(200).json({
      message: "Credentails Saved",
      credential,
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to save credentials",
    });
  }
};

export const deleteCredentialController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        message: "User Not found",
      });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      return res.status(400).json({
        message: "Credential ID is required",
      });
    }

    await workflowService.remove(userId, id);

    return res.status(200).json({
      message: "Credential deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to delete credential",
    });
  }
};

