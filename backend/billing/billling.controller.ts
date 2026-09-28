import type { Request, Response } from "express";
import * as billingService from "./billing.service";
import { getUserId } from "../workflows/workflow.controller";
import { prisma } from "../lib/prisma";

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
    const result = await billingService.getBalance(userId);

    return res.status(200).json({
      message: "Balance Loaded Successfully",
      balance: result.balance,
      plan: result.plan,
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
    let userId: string;
    try {
      userId = getUserId(req);
    } catch {
      if (req.body?.userId) {
        userId = req.body.userId;
      } else {
        const defaultUser = await prisma.user.findFirst();
        if (defaultUser) {
          userId = defaultUser.id;
        } else {
          throw new Error("Authentication token or valid user is required");
        }
      }
    }

    const { type, credits } = req.body;

    console.log("Purchase request:", {
      userId,
      type,
      credits,
    });

    const purchase = await billingService.makePayment(userId, type, credits);

    return res.status(200).json({
      message: "Payment order created successfully",
      purchase,
    });
  }
  catch (error: any) {
    return res.status(400).json({
      message:
        error?.error?.description ||
        error?.message ||
        "Failed to make purchase order",
    });
  }
};

export const verifyPaymentController = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId = razorpay_order_id,
      paymentId = razorpay_payment_id,
      signature = razorpay_signature,
    } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters (orderId, paymentId, signature)",
      });
    }

    const verificationResult = await billingService.verifyPayment({
      orderId,
      paymentId,
      signature,
    });

    return res.status(200).json(verificationResult);
  } catch (error: any) {
    console.error("VERIFY PAYMENT ERROR:", error);
    return res.status(400).json({
      success: false,
      message: error?.message || "Payment verification failed",
    });
  }
};

