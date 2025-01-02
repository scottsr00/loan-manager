/*
  Warnings:

  - You are about to drop the column `name` on the `Counterparty` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Counterparty` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfIncorporation` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `governmentId` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `governmentIdExpiry` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `governmentIdType` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `isAgent` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `primaryContactEmail` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `primaryContactName` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `primaryContactPhone` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `registrationNumber` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `counterpartyId` on the `Trade` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[entityId]` on the table `Counterparty` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `entityId` to the `Counterparty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerCounterpartyId` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parAmount` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerCounterpartyId` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `settlementAmount` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_counterpartyId_fkey";

-- DropIndex
DROP INDEX "Trade_counterpartyId_idx";

-- Step 1: Create temporary columns for storing existing data
ALTER TABLE "Counterparty" ADD COLUMN "temp_name" TEXT;
UPDATE "Counterparty" SET "temp_name" = "name";

-- Step 2: Create Entities for existing Counterparties
INSERT INTO "Entity" ("id", "legalName", "status", "createdAt", "updatedAt")
SELECT 
  'LEI_' || "id", -- Generate a temporary LEI
  "temp_name",
  'ACTIVE',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Counterparty";

-- Step 3: Add entityId column and update with generated LEIs
ALTER TABLE "Counterparty" ADD COLUMN "entityId" TEXT;
UPDATE "Counterparty" SET "entityId" = 'LEI_' || "id";

-- Step 4: Add trading status
ALTER TABLE "Counterparty" ADD COLUMN "tradingStatus" TEXT DEFAULT 'ACTIVE';

-- Step 5: Drop old columns
ALTER TABLE "Counterparty" DROP COLUMN "name";
ALTER TABLE "Counterparty" DROP COLUMN "status";
ALTER TABLE "Counterparty" DROP COLUMN "temp_name";

-- Step 6: Make entityId required and add constraints
ALTER TABLE "Counterparty" ALTER COLUMN "entityId" SET NOT NULL;
ALTER TABLE "Counterparty" ADD CONSTRAINT "Counterparty_entityId_key" UNIQUE ("entityId");
CREATE INDEX "Counterparty_entityId_idx" ON "Counterparty"("entityId");

-- Step 7: Add foreign key constraint
ALTER TABLE "Counterparty" ADD CONSTRAINT "Counterparty_entityId_fkey" 
  FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 8: Update Trade table structure
ALTER TABLE "Trade" ADD COLUMN "parAmount" DOUBLE PRECISION;
ALTER TABLE "Trade" ADD COLUMN "settlementAmount" DOUBLE PRECISION;
ALTER TABLE "Trade" ADD COLUMN "sellerCounterpartyId" TEXT;
ALTER TABLE "Trade" ADD COLUMN "buyerCounterpartyId" TEXT;

-- Step 9: Migrate existing trade data
UPDATE "Trade" SET 
  "parAmount" = "amount",
  "settlementAmount" = "amount",
  "sellerCounterpartyId" = "counterpartyId",
  "buyerCounterpartyId" = "counterpartyId"
WHERE "amount" IS NOT NULL AND "counterpartyId" IS NOT NULL;

-- Step 10: Make new trade columns required
ALTER TABLE "Trade" ALTER COLUMN "parAmount" SET NOT NULL;
ALTER TABLE "Trade" ALTER COLUMN "settlementAmount" SET NOT NULL;
ALTER TABLE "Trade" ALTER COLUMN "sellerCounterpartyId" SET NOT NULL;
ALTER TABLE "Trade" ALTER COLUMN "buyerCounterpartyId" SET NOT NULL;

-- Step 11: Drop old trade columns
ALTER TABLE "Trade" DROP COLUMN "amount";
ALTER TABLE "Trade" DROP COLUMN "counterpartyId";

-- Step 12: Add trade indexes and constraints
CREATE INDEX "Trade_sellerCounterpartyId_idx" ON "Trade"("sellerCounterpartyId");
CREATE INDEX "Trade_buyerCounterpartyId_idx" ON "Trade"("buyerCounterpartyId");

ALTER TABLE "Trade" ADD CONSTRAINT "Trade_sellerCounterpartyId_fkey" 
  FOREIGN KEY ("sellerCounterpartyId") REFERENCES "Counterparty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_buyerCounterpartyId_fkey" 
  FOREIGN KEY ("buyerCounterpartyId") REFERENCES "Counterparty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 13: Create KYC table
CREATE TABLE "KYC" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "lenderVerified" BOOLEAN NOT NULL DEFAULT false,
    "counterpartyVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastVerificationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "KYC_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "KYC_entityId_key" ON "KYC"("entityId");
CREATE INDEX "KYC_entityId_idx" ON "KYC"("entityId");

ALTER TABLE "KYC" ADD CONSTRAINT "KYC_entityId_fkey" 
  FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 14: Clean up Entity table
ALTER TABLE "Entity" 
  DROP COLUMN IF EXISTS "dateOfBirth",
  DROP COLUMN IF EXISTS "dateOfIncorporation",
  DROP COLUMN IF EXISTS "governmentId",
  DROP COLUMN IF EXISTS "governmentIdExpiry",
  DROP COLUMN IF EXISTS "governmentIdType",
  DROP COLUMN IF EXISTS "isAgent",
  DROP COLUMN IF EXISTS "primaryContactEmail",
  DROP COLUMN IF EXISTS "primaryContactName",
  DROP COLUMN IF EXISTS "primaryContactPhone",
  DROP COLUMN IF EXISTS "registrationNumber";
