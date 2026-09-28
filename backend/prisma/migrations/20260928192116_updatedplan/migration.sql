/*
  Warnings:

  - You are about to drop the column `label` on the `CreditPlan` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `CreditPlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CreditPlan" DROP COLUMN "label",
DROP COLUMN "updatedAt";
