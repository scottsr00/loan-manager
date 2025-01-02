/*
  Warnings:

  - You are about to drop the column `countryOfIncorporation` on the `Borrower` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Borrower` table. All the data in the column will be lost.
  - You are about to drop the column `taxId` on the `Borrower` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CreditAgreement" DROP CONSTRAINT "CreditAgreement_borrowerId_fkey";

-- AlterTable
ALTER TABLE "Borrower" DROP COLUMN "countryOfIncorporation",
DROP COLUMN "name",
DROP COLUMN "taxId";

-- AddForeignKey
ALTER TABLE "CreditAgreement" ADD CONSTRAINT "CreditAgreement_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
