/*
  Warnings:

  - You are about to drop the column `activityType` on the `ServicingActivity` table. All the data in the column will be lost.
  - You are about to drop the column `facilityOutstandingAmount` on the `ServicingActivity` table. All the data in the column will be lost.
  - You are about to drop the column `facilityOutstandingAmount` on the `Trade` table. All the data in the column will be lost.

*/
-- First, add the new column as nullable
ALTER TABLE "ServicingActivity" ADD COLUMN "type" TEXT;

-- Copy data from activityType to type
UPDATE "ServicingActivity" SET "type" = "activityType";

-- Now make the type column required
ALTER TABLE "ServicingActivity" ALTER COLUMN "type" SET NOT NULL;

-- Drop the old columns
ALTER TABLE "ServicingActivity" DROP COLUMN "activityType",
DROP COLUMN "facilityOutstandingAmount";

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "facilityOutstandingAmount";

-- CreateTable
CREATE TABLE "FacilityPositionHistory" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "changeDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeType" "PositionChangeType" NOT NULL,
    "previousCommitmentAmount" DOUBLE PRECISION NOT NULL,
    "newCommitmentAmount" DOUBLE PRECISION NOT NULL,
    "previousUndrawnAmount" DOUBLE PRECISION NOT NULL,
    "newUndrawnAmount" DOUBLE PRECISION NOT NULL,
    "previousDrawnAmount" DOUBLE PRECISION NOT NULL,
    "newDrawnAmount" DOUBLE PRECISION NOT NULL,
    "previousShare" DOUBLE PRECISION NOT NULL,
    "newShare" DOUBLE PRECISION NOT NULL,
    "previousStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "changeAmount" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "notes" TEXT,
    "servicingActivityId" TEXT,
    "tradeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityPositionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FacilityPositionHistory_facilityId_idx" ON "FacilityPositionHistory"("facilityId");

-- CreateIndex
CREATE INDEX "FacilityPositionHistory_lenderId_idx" ON "FacilityPositionHistory"("lenderId");

-- CreateIndex
CREATE INDEX "FacilityPositionHistory_servicingActivityId_idx" ON "FacilityPositionHistory"("servicingActivityId");

-- CreateIndex
CREATE INDEX "FacilityPositionHistory_tradeId_idx" ON "FacilityPositionHistory"("tradeId");

-- AddForeignKey
ALTER TABLE "FacilityPositionHistory" ADD CONSTRAINT "FacilityPositionHistory_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityPositionHistory" ADD CONSTRAINT "FacilityPositionHistory_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityPositionHistory" ADD CONSTRAINT "FacilityPositionHistory_servicingActivityId_fkey" FOREIGN KEY ("servicingActivityId") REFERENCES "ServicingActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityPositionHistory" ADD CONSTRAINT "FacilityPositionHistory_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
