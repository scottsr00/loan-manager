/*
  Warnings:

  - Made the column `tradingStatus` on table `Counterparty` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Counterparty" ALTER COLUMN "tradingStatus" SET NOT NULL;
