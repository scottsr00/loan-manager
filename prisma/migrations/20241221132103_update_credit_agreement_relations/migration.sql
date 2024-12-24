/*
  Warnings:

  - You are about to drop the column `agreementName` on the `CreditAgreement` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CreditAgreement" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
INSERT INTO "new_CreditAgreement" ("agreementNumber", "amount", "borrowerId", "createdAt", "currency", "description", "id", "interestRate", "lenderId", "maturityDate", "startDate", "status", "updatedAt") SELECT "agreementNumber", "amount", "borrowerId", "createdAt", "currency", "description", "id", "interestRate", "lenderId", "maturityDate", "startDate", "status", "updatedAt" FROM "CreditAgreement";
DROP TABLE "CreditAgreement";
ALTER TABLE "new_CreditAgreement" RENAME TO "CreditAgreement";
CREATE UNIQUE INDEX "CreditAgreement_agreementNumber_key" ON "CreditAgreement"("agreementNumber");
CREATE INDEX "CreditAgreement_borrowerId_idx" ON "CreditAgreement"("borrowerId");
CREATE INDEX "CreditAgreement_lenderId_idx" ON "CreditAgreement"("lenderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
