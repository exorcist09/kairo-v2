import { prisma } from "../lib/prisma";

async function main() {
  console.log("Starting seed...");

  const plans = [
    {
      type: "FREE_TIER" as const,
      credits: 50,
      price: 0,
      pricePerCredit: null,
      minCredits: null,
      maxCredits: null,
    },

    {
      type: "SMALL" as const,
      credits: 100,
      price: 99,
      pricePerCredit: null,
      minCredits: null,
      maxCredits: null,
    },

    {
      type: "MEDIUM" as const,
      credits: 500,
      price: 299,
      pricePerCredit: null,
      minCredits: null,
      maxCredits: null,
    },

    {
      type: "LARGE" as const,
      label: "Large",
      credits: 1200,
      price: 499,
      pricePerCredit: null,
      minCredits: null,
      maxCredits: null,
    },

    {
      type: "CUSTOM" as const,
      credits: null,
      price: null,
      pricePerCredit: 0.4,
      minCredits: 100,
      maxCredits: 10000,
    },
  ];

  for (const plan of plans) {
    await prisma.creditPlan.upsert({
      where: {
        type: plan.type,
      },

      update: {
        credits: plan.credits,
        price: plan.price,
        pricePerCredit: plan.pricePerCredit,
        minCredits: plan.minCredits,
        maxCredits: plan.maxCredits,
      },

      create: {
        type: plan.type,
        credits: plan.credits,
        price: plan.price,
        pricePerCredit: plan.pricePerCredit,
        minCredits: plan.minCredits,
        maxCredits: plan.maxCredits,
      },
    });
  }

  console.log("Credit plans seeded successfully");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });