/*
  Warnings:

  - You are about to drop the column `sellerCounterpartyId` on the `Trade` table. All the data in the column will be lost.
  - Added the required column `counterpartyId` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_sellerCounterpartyId_fkey";

-- DropIndex
DROP INDEX "Trade_sellerCounterpartyId_idx";

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "sellerCounterpartyId",
ADD COLUMN     "counterpartyId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Trade_counterpartyId_idx" ON "Trade"("counterpartyId");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
