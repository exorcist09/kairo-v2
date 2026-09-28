import type { Request, Response } from "express";
import * as billingService from "./billing.service";
import { getUserId } from "../workflows/workflow.controller";

export const getPlansController = async (req: Request, res: Response) => {
  try {
    const plans = await billingService.getPlans();
    return res.status(200).json({
      message: "Plan Loaded Successfully",
      plans,
    });
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to fetch plans",
    });
  }
};

export const getBalanceController = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const balance = await billingService.getBalance(userId);

    return res.status(200).json({
      message: "Balance Loaded Successfully",
      balance,
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to fetch balance",
    });
  }
};

export const getHistoryController = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const history = await billingService.getHistory(userId);

    return res.status(200).json({
      message: "History Loaded Successfully",
      history,
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to fetch history",
    });
  }
};

export const makePurchaseController = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { type, credits } = req.body;
    const purchase = await billingService.makePayment(userId, type, credits);

    return res.status(200).json({
      message: "Plan purchased successfully",
      purchase,
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to make payment",
    });
  }
};
