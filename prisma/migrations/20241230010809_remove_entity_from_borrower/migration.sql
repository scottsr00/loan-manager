/*
  Warnings:

  - You are about to drop the column `entityId` on the `Borrower` table. All the data in the column will be lost.
  - Added the required column `name` to the `Borrower` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the new columns without making name required yet
ALTER TABLE "Borrower" 
ADD COLUMN "countryOfIncorporation" TEXT,
ADD COLUMN "name" TEXT,
ADD COLUMN "taxId" TEXT;

-- Copy data from Entity to Borrower
UPDATE "Borrower" b
SET 
  "name" = e."legalName",
  "taxId" = e."taxId",
  "countryOfIncorporation" = e."countryOfIncorporation"
FROM "Entity" e
WHERE b."entityId" = e."id";

-- Now make name required
ALTER TABLE "Borrower" 
ALTER COLUMN "name" SET NOT NULL;

-- Update CreditAgreement to point to the correct borrower
UPDATE "CreditAgreement" ca
SET "borrowerId" = b."id"
FROM "Borrower" b
JOIN "Entity" e ON b."entityId" = e."id"
WHERE ca."borrowerId" = e."id";

-- Drop foreign key constraints
ALTER TABLE "Borrower" DROP CONSTRAINT "Borrower_entityId_fkey";
ALTER TABLE "CreditAgreement" DROP CONSTRAINT "CreditAgreement_borrowerId_fkey";

-- Drop indexes
DROP INDEX "Borrower_entityId_idx";
DROP INDEX "Borrower_entityId_key";

-- Drop the entityId column
ALTER TABLE "Borrower" DROP COLUMN "entityId";

-- Add new foreign key for CreditAgreement
ALTER TABLE "CreditAgreement" ADD CONSTRAINT "CreditAgreement_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
