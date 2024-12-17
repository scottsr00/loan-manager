/*
  Warnings:

  - You are about to drop the column `name` on the `Counterparty` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Counterparty` table. All the data in the column will be lost.
  - Added the required column `legalName` to the `Counterparty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeId` to the `Counterparty` table without a default value. This is not possible if the table is not empty.
  - Made the column `agreementName` on table `CreditAgreement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `agreementNumber` on table `CreditAgreement` required. This step will fail if there are existing NULL values in that column.

*/

-- CreateTable
CREATE TABLE "CounterpartyType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Insert default CounterpartyType
INSERT INTO "CounterpartyType" ("id", "name", "description", "createdAt", "updatedAt")
VALUES ('default-bank-type', 'BANK', 'Default bank type for existing counterparties', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- CreateTable
CREATE TABLE "CounterpartyAddress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "counterpartyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "street1" TEXT NOT NULL,
    "street2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CounterpartyAddress_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CounterpartyContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "counterpartyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CounterpartyContact_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Counterparty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "legalName" TEXT NOT NULL,
    "dba" TEXT,
    "registrationNumber" TEXT,
    "taxId" TEXT,
    "typeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "incorporationDate" DATETIME,
    "website" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Counterparty_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CounterpartyType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Counterparty" ("id", "legalName", "typeId", "status", "createdAt", "updatedAt") 
SELECT "id", "name", 'default-bank-type', "status", "createdAt", "updatedAt" FROM "Counterparty";
DROP TABLE "Counterparty";
ALTER TABLE "new_Counterparty" RENAME TO "Counterparty";
CREATE INDEX "Counterparty_typeId_idx" ON "Counterparty"("typeId");

CREATE TABLE "new_CreditAgreement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agreementName" TEXT NOT NULL,
    "agreementNumber" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" DATETIME NOT NULL,
    "maturityDate" DATETIME NOT NULL,
    "interestRate" REAL NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreditAgreement_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CreditAgreement_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CreditAgreement" ("agreementName", "agreementNumber", "amount", "borrowerId", "createdAt", "currency", "description", "id", "interestRate", "lenderId", "maturityDate", "startDate", "status", "updatedAt") 
SELECT "agreementName", "agreementNumber", "amount", "borrowerId", "createdAt", "currency", "description", "id", "interestRate", "lenderId", "maturityDate", "startDate", "status", "updatedAt" FROM "CreditAgreement";
DROP TABLE "CreditAgreement";
ALTER TABLE "new_CreditAgreement" RENAME TO "CreditAgreement";
CREATE UNIQUE INDEX "CreditAgreement_agreementNumber_key" ON "CreditAgreement"("agreementNumber");
CREATE INDEX "CreditAgreement_borrowerId_idx" ON "CreditAgreement"("borrowerId");
CREATE INDEX "CreditAgreement_lenderId_idx" ON "CreditAgreement"("lenderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CounterpartyAddress_counterpartyId_idx" ON "CounterpartyAddress"("counterpartyId");

-- CreateIndex
CREATE INDEX "CounterpartyContact_counterpartyId_idx" ON "CounterpartyContact"("counterpartyId");
