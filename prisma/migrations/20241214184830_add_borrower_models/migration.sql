/*
  Warnings:

  - You are about to drop the `Counterparty` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CounterpartyAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CounterpartyContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CounterpartyDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CounterpartyType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HistoricalBalance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lender` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LenderPosition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Loan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServicingActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TradeComment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Counterparty_counterpartyTypeId_idx";

-- DropIndex
DROP INDEX "CounterpartyAddress_counterpartyId_idx";

-- DropIndex
DROP INDEX "CounterpartyContact_counterpartyId_idx";

-- DropIndex
DROP INDEX "CounterpartyDocument_counterpartyId_idx";

-- DropIndex
DROP INDEX "CounterpartyType_name_key";

-- DropIndex
DROP INDEX "Lender_name_key";

-- DropIndex
DROP INDEX "Loan_facilityId_idx";

-- DropIndex
DROP INDEX "ServicingActivity_status_idx";

-- DropIndex
DROP INDEX "ServicingActivity_dueDate_idx";

-- DropIndex
DROP INDEX "ServicingActivity_loanId_idx";

-- DropIndex
DROP INDEX "TradeComment_tradeId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Counterparty";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CounterpartyAddress";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CounterpartyContact";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CounterpartyDocument";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CounterpartyType";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HistoricalBalance";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Lender";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LenderPosition";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Loan";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ServicingActivity";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Trade";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TradeComment";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Borrower" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "onboardingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "onboardingDate" DATETIME,
    "approvalDate" DATETIME,
    "lastReviewDate" DATETIME,
    "nextReviewDate" DATETIME,
    "creditRating" TEXT,
    "ratingAgency" TEXT,
    "ratingDate" DATETIME,
    "watchStatus" TEXT,
    "annualRevenue" REAL,
    "totalAssets" REAL,
    "totalLiabilities" REAL,
    "netWorth" REAL,
    "fiscalYearEnd" TEXT,
    "lastFinancialsDate" DATETIME,
    "documentationStatus" TEXT NOT NULL DEFAULT 'INCOMPLETE',
    "riskRating" TEXT,
    "riskRatingDate" DATETIME,
    "riskComments" TEXT,
    "sicCode" TEXT,
    "naicsCode" TEXT,
    "industrySegment" TEXT,
    "amlStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "sanctionsScreening" TEXT NOT NULL DEFAULT 'PENDING',
    "lastScreeningDate" DATETIME,
    "relationshipManager" TEXT,
    "customerSince" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Borrower_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BorrowerRequiredDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowerId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "required" BOOLEAN NOT NULL DEFAULT true,
    "documentUrl" TEXT,
    "submissionDate" DATETIME,
    "expirationDate" DATETIME,
    "comments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BorrowerRequiredDocument_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BorrowerFinancialStatement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowerId" TEXT NOT NULL,
    "statementType" TEXT NOT NULL,
    "statementDate" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "revenue" REAL,
    "ebitda" REAL,
    "netIncome" REAL,
    "totalAssets" REAL,
    "totalLiabilities" REAL,
    "totalEquity" REAL,
    "cashFlow" REAL,
    "workingCapital" REAL,
    "documentUrl" TEXT,
    "auditStatus" TEXT NOT NULL DEFAULT 'UNAUDITED',
    "auditor" TEXT,
    "comments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BorrowerFinancialStatement_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BorrowerCovenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowerId" TEXT NOT NULL,
    "covenantType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "threshold" REAL,
    "frequency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLIANT',
    "lastTestDate" DATETIME,
    "nextTestDate" DATETIME,
    "comments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BorrowerCovenant_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CreditAgreement" (
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
    CONSTRAINT "CreditAgreement_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CreditAgreement_agentBankId_fkey" FOREIGN KEY ("agentBankId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CreditAgreement" ("agentBankId", "agreementName", "agreementNumber", "borrowerId", "createdAt", "currency", "description", "effectiveDate", "id", "maturityDate", "status", "totalAmount", "updatedAt") SELECT "agentBankId", "agreementName", "agreementNumber", "borrowerId", "createdAt", "currency", "description", "effectiveDate", "id", "maturityDate", "status", "totalAmount", "updatedAt" FROM "CreditAgreement";
DROP TABLE "CreditAgreement";
ALTER TABLE "new_CreditAgreement" RENAME TO "CreditAgreement";
CREATE UNIQUE INDEX "CreditAgreement_agreementNumber_key" ON "CreditAgreement"("agreementNumber");
CREATE INDEX "CreditAgreement_borrowerId_idx" ON "CreditAgreement"("borrowerId");
CREATE INDEX "CreditAgreement_agentBankId_idx" ON "CreditAgreement"("agentBankId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Borrower_entityId_key" ON "Borrower"("entityId");

-- CreateIndex
CREATE INDEX "Borrower_entityId_idx" ON "Borrower"("entityId");

-- CreateIndex
CREATE INDEX "BorrowerRequiredDocument_borrowerId_idx" ON "BorrowerRequiredDocument"("borrowerId");

-- CreateIndex
CREATE INDEX "BorrowerFinancialStatement_borrowerId_idx" ON "BorrowerFinancialStatement"("borrowerId");

-- CreateIndex
CREATE INDEX "BorrowerCovenant_borrowerId_idx" ON "BorrowerCovenant"("borrowerId");
