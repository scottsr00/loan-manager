-- CreateEnum
CREATE TYPE "PositionChangeType" AS ENUM ('PAYDOWN', 'ACCRUAL', 'TRADE');

-- CreateTable
CREATE TABLE "LenderPositionHistory" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "changeDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeType" "PositionChangeType" NOT NULL,
    "previousOutstandingAmount" DOUBLE PRECISION NOT NULL,
    "newOutstandingAmount" DOUBLE PRECISION NOT NULL,
    "previousAccruedInterest" DOUBLE PRECISION NOT NULL,
    "newAccruedInterest" DOUBLE PRECISION NOT NULL,
    "changeAmount" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LenderPositionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LenderPositionHistory_facilityId_idx" ON "LenderPositionHistory"("facilityId");

-- CreateIndex
CREATE INDEX "LenderPositionHistory_lenderId_idx" ON "LenderPositionHistory"("lenderId");

-- AddForeignKey
ALTER TABLE "LenderPositionHistory" ADD CONSTRAINT "LenderPositionHistory_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LenderPositionHistory" ADD CONSTRAINT "LenderPositionHistory_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
