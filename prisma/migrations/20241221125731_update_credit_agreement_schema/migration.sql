/*
  Warnings:

  - You are about to drop the column `agreementType` on the `CreditAgreement` table. All the data in the column will be lost.
  - You are about to drop the column `effectiveDate` on the `CreditAgreement` table. All the data in the column will be lost.
  - Added the required column `agreementName` to the `CreditAgreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `CreditAgreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `borrowerId` to the `CreditAgreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interestRate` to the `CreditAgreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maturityDate` to the `CreditAgreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `CreditAgreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseRate` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commitmentAmount` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facilityName` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facilityType` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interestType` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `margin` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maturityDate` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Facility` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CreditAgreement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agreementName" TEXT NOT NULL,
    "agreementNumber" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" DATETIME NOT NULL,
    "maturityDate" DATETIME NOT NULL,
    "interestRate" REAL NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreditAgreement_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CreditAgreement_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CreditAgreement" ("agreementNumber", "createdAt", "id", "lenderId", "status", "updatedAt") SELECT "agreementNumber", "createdAt", "id", "lenderId", "status", "updatedAt" FROM "CreditAgreement";
DROP TABLE "CreditAgreement";
ALTER TABLE "new_CreditAgreement" RENAME TO "CreditAgreement";
CREATE UNIQUE INDEX "CreditAgreement_agreementNumber_key" ON "CreditAgreement"("agreementNumber");
CREATE INDEX "CreditAgreement_borrowerId_idx" ON "CreditAgreement"("borrowerId");
CREATE INDEX "CreditAgreement_lenderId_idx" ON "CreditAgreement"("lenderId");
CREATE TABLE "new_Facility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityName" TEXT NOT NULL,
    "facilityType" TEXT NOT NULL,
    "creditAgreementId" TEXT NOT NULL,
    "commitmentAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" DATETIME NOT NULL,
    "maturityDate" DATETIME NOT NULL,
    "interestType" TEXT NOT NULL,
    "baseRate" TEXT NOT NULL,
    "margin" REAL NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Facility_creditAgreementId_fkey" FOREIGN KEY ("creditAgreementId") REFERENCES "CreditAgreement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Facility" ("createdAt", "creditAgreementId", "id", "updatedAt") SELECT "createdAt", "creditAgreementId", "id", "updatedAt" FROM "Facility";
DROP TABLE "Facility";
ALTER TABLE "new_Facility" RENAME TO "Facility";
CREATE INDEX "Facility_creditAgreementId_idx" ON "Facility"("creditAgreementId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
