/*
  Warnings:

  - Added the required column `facilityId` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "CreditAgreement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agreementName" TEXT NOT NULL,
    "agreementNumber" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "agentBankId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "effectiveDate" DATETIME NOT NULL,
    "maturityDate" DATETIME NOT NULL,
    "totalAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreditAgreement_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CreditAgreement_agentBankId_fkey" FOREIGN KEY ("agentBankId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityName" TEXT NOT NULL,
    "facilityType" TEXT NOT NULL,
    "creditAgreementId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
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

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dealName" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "currentBalance" REAL NOT NULL,
    "currentPeriodTerms" TEXT NOT NULL,
    "priorPeriodPaymentStatus" TEXT NOT NULL,
    "agentBank" TEXT NOT NULL,
    "borrower" TEXT NOT NULL DEFAULT 'Unknown',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maturityDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Loan_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Loan" ("agentBank", "borrower", "createdAt", "currentBalance", "currentPeriodTerms", "dealName", "id", "maturityDate", "priorPeriodPaymentStatus", "startDate", "updatedAt") SELECT "agentBank", "borrower", "createdAt", "currentBalance", "currentPeriodTerms", "dealName", "id", "maturityDate", "priorPeriodPaymentStatus", "startDate", "updatedAt" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
CREATE INDEX "Loan_facilityId_idx" ON "Loan"("facilityId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CreditAgreement_agreementNumber_key" ON "CreditAgreement"("agreementNumber");

-- CreateIndex
CREATE INDEX "CreditAgreement_borrowerId_idx" ON "CreditAgreement"("borrowerId");

-- CreateIndex
CREATE INDEX "CreditAgreement_agentBankId_idx" ON "CreditAgreement"("agentBankId");

-- CreateIndex
CREATE INDEX "Facility_creditAgreementId_idx" ON "Facility"("creditAgreementId");
