import crypto from "crypto";
import type { CreditPlanType } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { razorpay } from "../lib/razorpay";

export const getPlans = async () => {
  return prisma.creditPlan.findMany({
    orderBy: {
      price: "asc",
    },
  });
};

export const getBalance = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.creditBalance;
};

export const getHistory = async (userId: string) => {
  return prisma.creditLedger.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const makePayment = async (
  userId: string,
  type: CreditPlanType,
  credits?: number,
) => {

  // 1. find plan frontend woudl already send -> Free_tier, small, medium, large, custom
  const plan = await prisma.creditPlan.findUnique({
    where: { type: type },
  });

  if (!plan) {
    throw new Error("Plan not found");
  }

  let creditsToBePurchased: number;
  let amountToBePaid: number;

  if (plan.type === "CUSTOM") {
    if (!credits) {
      throw new Error("Credits are required for custom plan");
    }

    if (plan.minCredits !== null && credits < plan.minCredits) {
      throw new Error(`Minimum ${plan.minCredits} credits required`);
    }

    if (plan.maxCredits !== null && credits > plan.maxCredits) {
      throw new Error(`Maximum ${plan.maxCredits} credits allowed`);
    }
    if (plan.pricePerCredit === null) {
      throw new Error("Custom pricing is not configured");
    }

    creditsToBePurchased = credits;
    amountToBePaid = credits * Number(plan.pricePerCredit);
  } else {
    // for FREE_TIER, SMALL, MEDIUM, LARGE, then u need not to send the credits as well
    if (plan.credits === null || plan.price === null) {
      throw new Error("Invalid credit plan configuration");
    }

    creditsToBePurchased = plan.credits;
    amountToBePaid = Number(plan.price);
  }

  if (amountToBePaid <= 0) {
    throw new Error("Cannot create payment order for free plan");
  }

  //   3. Create a purchase record in Db
  const purchase = await prisma.creditPurchase.create({
    data: {
      userId,
      planId: plan.id,
      creditsPurchased: creditsToBePurchased,
      amountPaid: amountToBePaid,
      currency: "INR",
      status: "PENDING",
    },
  });

  //   4. Razorpay expects amount in paise
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amountToBePaid * 100),
    currency: "INR",
    receipt: purchase.id,
  });

  await prisma.creditPurchase.update({
    where: { id: purchase.id },
    data: { providerRefId: razorpayOrder.id },
  });

  return {
    purchaseId: purchase.id,

    order: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },

    credits: creditsToBePurchased,
    amount: amountToBePaid,

    razorpayKey: process.env.RAZORPAY_KEY_ID,
  };
};

interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export const verifyPayment = async ({
  orderId,
  paymentId,
  signature,
}: VerifyPaymentParams) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("Razorpay secret is not configured on the server");
  }

  // 1. Generate expected HMAC SHA256 signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // 2. Compare generated signature with razorpay_signature using timingSafeEqual
  const isMatch =
    generatedSignature.length === signature.length &&
    crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(signature),
    );

  if (!isMatch) {
    await prisma.creditPurchase.updateMany({
      where: { providerRefId: orderId },
      data: { status: "FAILED" },
    });
    throw new Error("Payment signature verification failed");
  }

  // 3. Find purchase record by Razorpay order ID (providerRefId)
  const purchase = await prisma.creditPurchase.findUnique({
    where: { providerRefId: orderId },
  });

  if (!purchase) {
    throw new Error("Purchase order record not found");
  }

  // Idempotency: if already processed, return current balance
  if (purchase.status === "SUCCESS") {
    const user = await prisma.user.findUnique({
      where: { id: purchase.userId },
    });
    return {
      success: true,
      message: "Payment already verified",
      purchaseId: purchase.id,
      creditsAdded: purchase.creditsPurchased,
      balance: user?.creditBalance ?? 0,
    };
  }

  // 4. Atomic transaction: mark purchase SUCCESS, credit user balance, log in ledger
  const result = await prisma.$transaction(async (tx) => {
    const updatedPurchase = await tx.creditPurchase.update({
      where: { id: purchase.id },
      data: {
        status: "SUCCESS",
        providerPaymentId: paymentId,
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: purchase.userId },
      data: {
        creditBalance: {
          increment: purchase.creditsPurchased,
        },
      },
    });

    const ledger = await tx.creditLedger.create({
      data: {
        userId: purchase.userId,
        type: "PURCHASE",
        amount: purchase.creditsPurchased,
        balanceAfter: updatedUser.creditBalance,
        purchaseId: purchase.id,
      },
    });

    return { updatedPurchase, updatedUser, ledger };
  });

  return {
    success: true,
    message: "Payment verified successfully",
    purchaseId: result.updatedPurchase.id,
    creditsAdded: purchase.creditsPurchased,
    newBalance: result.updatedUser.creditBalance,
  };
};

