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
    where: { id: userId },
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
