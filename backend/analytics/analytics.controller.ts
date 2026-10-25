import type { Request, Response } from "express";
import { getUserId } from "../workflows/workflow.controller";
import * as analyticsService from "./analytics.service";

export const getHomeAnalyticsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = getUserId(req);
    const data = await analyticsService.getHomeAnalytics(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Home analytics controller error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load analytics";
    const status = message.includes("Token") || message.includes("jwt") ? 401 : 400;
    return res.status(status).json({
      success: false,
      message,
    });
  }
};
