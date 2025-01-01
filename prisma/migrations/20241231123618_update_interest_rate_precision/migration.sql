/*
  Warnings:

  - You are about to alter the column `interestRate` on the `CreditAgreement` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,5)`.
  - You are about to alter the column `margin` on the `Facility` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,5)`.
  - You are about to alter the column `baseRate` on the `Loan` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,5)`.
  - You are about to alter the column `effectiveRate` on the `Loan` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,5)`.

*/
-- AlterTable
ALTER TABLE "CreditAgreement" ALTER COLUMN "interestRate" SET DATA TYPE DECIMAL(7,5);

-- AlterTable
ALTER TABLE "Facility" ALTER COLUMN "margin" SET DATA TYPE DECIMAL(7,5);

-- AlterTable
ALTER TABLE "Loan" ALTER COLUMN "baseRate" DROP DEFAULT,
ALTER COLUMN "baseRate" SET DATA TYPE DECIMAL(7,5),
ALTER COLUMN "effectiveRate" DROP DEFAULT,
ALTER COLUMN "effectiveRate" SET DATA TYPE DECIMAL(7,5);
