/*
  Warnings:

  - You are about to drop the column `name` on the `Counterparty` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Trade` table. All the data in the column will be lost.
  - Added the required column `settlementAmount` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('SERVICING', 'TRADE');

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_entityId_fkey";

-- DropIndex
DROP INDEX "CounterpartyType_name_key";

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "counterpartyId" TEXT,
ALTER COLUMN "entityId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Counterparty" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "LenderPositionHistory" ADD COLUMN     "servicingActivityId" TEXT,
ADD COLUMN     "tradeId" TEXT;

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "description",
ADD COLUMN     "settlementAmount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "tradeDate" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Contact_counterpartyId_idx" ON "Contact"("counterpartyId");

-- CreateIndex
CREATE INDEX "LenderPositionHistory_servicingActivityId_idx" ON "LenderPositionHistory"("servicingActivityId");

-- CreateIndex
CREATE INDEX "LenderPositionHistory_tradeId_idx" ON "LenderPositionHistory"("tradeId");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LenderPositionHistory" ADD CONSTRAINT "LenderPositionHistory_servicingActivityId_fkey" FOREIGN KEY ("servicingActivityId") REFERENCES "ServicingActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LenderPositionHistory" ADD CONSTRAINT "LenderPositionHistory_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
