/*
  Warnings:

  - You are about to drop the column `type` on the `Counterparty` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ServicingActivity` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `TransactionHistory` table. All the data in the column will be lost.
  - Added the required column `typeId` to the `Counterparty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `availableAmount` to the `Facility` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outstandingAmount` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activityType` to the `ServicingActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `ServicingActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activityType` to the `TransactionHistory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "CounterpartyType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Counterparty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Counterparty_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CounterpartyType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Counterparty" ("createdAt", "id", "name", "status", "updatedAt") SELECT "createdAt", "id", "name", "status", "updatedAt" FROM "Counterparty";
DROP TABLE "Counterparty";
ALTER TABLE "new_Counterparty" RENAME TO "Counterparty";
CREATE INDEX "Counterparty_typeId_idx" ON "Counterparty"("typeId");
CREATE TABLE "new_Facility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityName" TEXT NOT NULL,
    "facilityType" TEXT NOT NULL,
    "creditAgreementId" TEXT NOT NULL,
    "commitmentAmount" REAL NOT NULL,
    "availableAmount" REAL NOT NULL,
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
INSERT INTO "new_Facility" ("baseRate", "commitmentAmount", "createdAt", "creditAgreementId", "currency", "description", "facilityName", "facilityType", "id", "interestType", "margin", "maturityDate", "startDate", "updatedAt") SELECT "baseRate", "commitmentAmount", "createdAt", "creditAgreementId", "currency", "description", "facilityName", "facilityType", "id", "interestType", "margin", "maturityDate", "startDate", "updatedAt" FROM "Facility";
DROP TABLE "Facility";
ALTER TABLE "new_Facility" RENAME TO "Facility";
CREATE INDEX "Facility_creditAgreementId_idx" ON "Facility"("creditAgreementId");
CREATE TABLE "new_Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "outstandingAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Loan_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Loan" ("amount", "createdAt", "currency", "facilityId", "id", "status", "updatedAt") SELECT "amount", "createdAt", "currency", "facilityId", "id", "status", "updatedAt" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
CREATE INDEX "Loan_facilityId_idx" ON "Loan"("facilityId");
CREATE TABLE "new_ServicingActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "description" TEXT,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" DATETIME,
    "completedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServicingActivity_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ServicingActivity" ("createdAt", "description", "dueDate", "facilityId", "id", "status", "updatedAt") SELECT "createdAt", "description", "dueDate", "facilityId", "id", "status", "updatedAt" FROM "ServicingActivity";
DROP TABLE "ServicingActivity";
ALTER TABLE "new_ServicingActivity" RENAME TO "ServicingActivity";
CREATE INDEX "ServicingActivity_facilityId_idx" ON "ServicingActivity"("facilityId");
CREATE TABLE "new_TransactionHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creditAgreementId" TEXT,
    "loanId" TEXT,
    "tradeId" TEXT,
    "servicingActivityId" TEXT,
    "activityType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "effectiveDate" DATETIME NOT NULL,
    "processedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransactionHistory_creditAgreementId_fkey" FOREIGN KEY ("creditAgreementId") REFERENCES "CreditAgreement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransactionHistory_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransactionHistory_servicingActivityId_fkey" FOREIGN KEY ("servicingActivityId") REFERENCES "ServicingActivity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransactionHistory_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TransactionHistory" ("amount", "createdAt", "creditAgreementId", "currency", "description", "effectiveDate", "id", "loanId", "processedBy", "servicingActivityId", "status", "tradeId", "updatedAt") SELECT "amount", "createdAt", "creditAgreementId", "currency", "description", "effectiveDate", "id", "loanId", "processedBy", "servicingActivityId", "status", "tradeId", "updatedAt" FROM "TransactionHistory";
DROP TABLE "TransactionHistory";
ALTER TABLE "new_TransactionHistory" RENAME TO "TransactionHistory";
CREATE INDEX "TransactionHistory_creditAgreementId_idx" ON "TransactionHistory"("creditAgreementId");
CREATE INDEX "TransactionHistory_loanId_idx" ON "TransactionHistory"("loanId");
CREATE INDEX "TransactionHistory_tradeId_idx" ON "TransactionHistory"("tradeId");
CREATE INDEX "TransactionHistory_servicingActivityId_idx" ON "TransactionHistory"("servicingActivityId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CounterpartyType_name_key" ON "CounterpartyType"("name");
