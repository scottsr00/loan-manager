/*
  Warnings:

  - You are about to drop the column `name` on the `Borrower` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Borrower` table. All the data in the column will be lost.
  - Added the required column `entityId` to the `Borrower` table without a default value. This is not possible if the table is not empty.
  - Added the required column `industrySegment` to the `Borrower` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "BorrowerFinancialStatement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowerId" TEXT NOT NULL,
    "statementType" TEXT NOT NULL,
    "statementDate" DATETIME NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "fiscalPeriod" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "revenue" REAL NOT NULL,
    "ebitda" REAL NOT NULL,
    "netIncome" REAL NOT NULL,
    "totalAssets" REAL NOT NULL,
    "totalLiabilities" REAL NOT NULL,
    "currentAssets" REAL NOT NULL,
    "currentLiabilities" REAL NOT NULL,
    "cashFlow" REAL NOT NULL,
    "workingCapital" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BorrowerFinancialStatement_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BorrowerCovenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowerId" TEXT NOT NULL,
    "covenantType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "threshold" REAL NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastTestDate" DATETIME,
    "lastTestResult" TEXT,
    "nextTestDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BorrowerCovenant_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BorrowerRequiredDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowerId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL,
    "dueDate" DATETIME,
    "receivedDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "documentUrl" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BorrowerRequiredDocument_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BorrowerAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowerId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "changes" TEXT,
    "performedBy" TEXT NOT NULL,
    "performedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BorrowerAuditLog_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Borrower" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityId" TEXT NOT NULL,
    "industrySegment" TEXT NOT NULL,
    "businessType" TEXT NOT NULL DEFAULT 'CORPORATE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "riskRating" TEXT,
    "creditRating" TEXT,
    "ratingAgency" TEXT,
    "onboardingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "amlStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "sanctionsStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Borrower_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Borrower" ("createdAt", "id", "status", "updatedAt") SELECT "createdAt", "id", "status", "updatedAt" FROM "Borrower";
DROP TABLE "Borrower";
ALTER TABLE "new_Borrower" RENAME TO "Borrower";
CREATE UNIQUE INDEX "Borrower_entityId_key" ON "Borrower"("entityId");
CREATE INDEX "Borrower_entityId_idx" ON "Borrower"("entityId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "BorrowerFinancialStatement_borrowerId_idx" ON "BorrowerFinancialStatement"("borrowerId");

-- CreateIndex
CREATE INDEX "BorrowerFinancialStatement_statementDate_idx" ON "BorrowerFinancialStatement"("statementDate");

-- CreateIndex
CREATE INDEX "BorrowerCovenant_borrowerId_idx" ON "BorrowerCovenant"("borrowerId");

-- CreateIndex
CREATE INDEX "BorrowerRequiredDocument_borrowerId_idx" ON "BorrowerRequiredDocument"("borrowerId");

-- CreateIndex
CREATE INDEX "BorrowerAuditLog_borrowerId_idx" ON "BorrowerAuditLog"("borrowerId");

-- CreateIndex
CREATE INDEX "BorrowerAuditLog_performedAt_idx" ON "BorrowerAuditLog"("performedAt");
