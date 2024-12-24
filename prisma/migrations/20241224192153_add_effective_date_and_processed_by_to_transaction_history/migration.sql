/*
  Warnings:

  - Added the required column `effectiveDate` to the `TransactionHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `processedBy` to the `TransactionHistory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TransactionHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creditAgreementId" TEXT,
    "loanId" TEXT,
    "tradeId" TEXT,
    "servicingActivityId" TEXT,
    "type" TEXT NOT NULL,
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
INSERT INTO "new_TransactionHistory" ("amount", "createdAt", "creditAgreementId", "currency", "description", "id", "loanId", "servicingActivityId", "status", "tradeId", "type", "updatedAt") SELECT "amount", "createdAt", "creditAgreementId", "currency", "description", "id", "loanId", "servicingActivityId", "status", "tradeId", "type", "updatedAt" FROM "TransactionHistory";
DROP TABLE "TransactionHistory";
ALTER TABLE "new_TransactionHistory" RENAME TO "TransactionHistory";
CREATE INDEX "TransactionHistory_creditAgreementId_idx" ON "TransactionHistory"("creditAgreementId");
CREATE INDEX "TransactionHistory_loanId_idx" ON "TransactionHistory"("loanId");
CREATE INDEX "TransactionHistory_tradeId_idx" ON "TransactionHistory"("tradeId");
CREATE INDEX "TransactionHistory_servicingActivityId_idx" ON "TransactionHistory"("servicingActivityId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
