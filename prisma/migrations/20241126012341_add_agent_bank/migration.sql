/*
  Warnings:

  - Added the required column `agentBank` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dealName" TEXT NOT NULL,
    "currentBalance" REAL NOT NULL,
    "currentPeriodTerms" TEXT NOT NULL,
    "priorPeriodPaymentStatus" TEXT NOT NULL,
    "agentBank" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Loan" ("createdAt", "currentBalance", "currentPeriodTerms", "dealName", "id", "priorPeriodPaymentStatus", "updatedAt") SELECT "createdAt", "currentBalance", "currentPeriodTerms", "dealName", "id", "priorPeriodPaymentStatus", "updatedAt" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
