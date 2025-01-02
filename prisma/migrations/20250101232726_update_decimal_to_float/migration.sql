/*
  Warnings:

  - You are about to alter the column `interestRate` on the `CreditAgreement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(7,5)` to `DoublePrecision`.
  - You are about to alter the column `margin` on the `Facility` table. The data in that column could be lost. The data in that column will be cast from `Decimal(7,5)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "CreditAgreement" ALTER COLUMN "interestRate" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Facility" ALTER COLUMN "margin" SET DATA TYPE DOUBLE PRECISION;
