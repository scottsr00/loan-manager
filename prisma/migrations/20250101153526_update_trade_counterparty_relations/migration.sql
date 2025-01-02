/*
  Warnings:

  - You are about to drop the column `counterpartyId` on the `Trade` table. All the data in the column will be lost.
  - Added the required column `sellerCounterpartyId` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_counterpartyId_fkey";

-- DropIndex
DROP INDEX "Trade_counterpartyId_idx";

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "counterpartyId",
ADD COLUMN     "sellerCounterpartyId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Trade_sellerCounterpartyId_idx" ON "Trade"("sellerCounterpartyId");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_sellerCounterpartyId_fkey" FOREIGN KEY ("sellerCounterpartyId") REFERENCES "Counterparty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
