/*
  Warnings:

  - You are about to drop the `CounterpartyAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CounterpartyContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CounterpartyType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServicingRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServicingTeamMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `dba` on the `Counterparty` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Counterparty` table. All the data in the column will be lost.
  - You are about to drop the column `incorporationDate` on the `Counterparty` table. All the data in the column will be lost.
  - You are about to drop the column `legalName` on the `Counterparty` table. All the data in the column will be lost.
  - You are about to drop the column `registrationNumber` on the `Counterparty` table. All the data in the column will be lost.
  - You are about to drop the column `taxId` on the `Counterparty` table. All the data in the column will be lost.
  - You are about to drop the column `typeId` on the `Counterparty` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Counterparty` table. All the data in the column will be lost.
  - You are about to drop the column `jurisdiction` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `activityType` on the `ServicingActivity` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `ServicingActivity` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `ServicingActivity` table. All the data in the column will be lost.
  - You are about to drop the column `completedBy` on the `ServicingActivity` table. All the data in the column will be lost.
  - You are about to drop the column `assignmentType` on the `ServicingAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `ServicingAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `ServicingAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `ServicingAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `teamMemberId` on the `ServicingAssignment` table. All the data in the column will be lost.
  - Added the required column `name` to the `Counterparty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Counterparty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `ServicingActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assignedTo` to the `ServicingAssignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicingActivityId` to the `ServicingAssignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `TransactionHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `TransactionHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CounterpartyAddress_counterpartyId_idx";

-- DropIndex
DROP INDEX "CounterpartyContact_counterpartyId_idx";

-- DropIndex
DROP INDEX "ServicingTeamMember_roleId_idx";

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
DROP TABLE "CounterpartyType";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ServicingRole";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ServicingTeamMember";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Counterparty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Counterparty" ("createdAt", "id", "status", "updatedAt") SELECT "createdAt", "id", "status", "updatedAt" FROM "Counterparty";
DROP TABLE "Counterparty";
ALTER TABLE "new_Counterparty" RENAME TO "Counterparty";
CREATE TABLE "new_Entity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "legalName" TEXT NOT NULL,
    "dba" TEXT,
    "registrationNumber" TEXT,
    "taxId" TEXT,
    "dateOfBirth" DATETIME,
    "dateOfIncorporation" DATETIME,
    "countryOfIncorporation" TEXT,
    "governmentId" TEXT,
    "governmentIdType" TEXT,
    "governmentIdExpiry" DATETIME,
    "primaryContactName" TEXT,
    "primaryContactEmail" TEXT,
    "primaryContactPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Entity" ("createdAt", "dateOfBirth", "dateOfIncorporation", "dba", "governmentId", "governmentIdExpiry", "governmentIdType", "id", "legalName", "primaryContactEmail", "primaryContactName", "primaryContactPhone", "registrationNumber", "status", "taxId", "updatedAt") SELECT "createdAt", "dateOfBirth", "dateOfIncorporation", "dba", "governmentId", "governmentIdExpiry", "governmentIdType", "id", "legalName", "primaryContactEmail", "primaryContactName", "primaryContactPhone", "registrationNumber", "status", "taxId", "updatedAt" FROM "Entity";
DROP TABLE "Entity";
ALTER TABLE "new_Entity" RENAME TO "Entity";
CREATE TABLE "new_ServicingActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" DATETIME NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServicingActivity_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ServicingActivity" ("createdAt", "description", "dueDate", "facilityId", "id", "status", "updatedAt") SELECT "createdAt", "description", "dueDate", "facilityId", "id", "status", "updatedAt" FROM "ServicingActivity";
DROP TABLE "ServicingActivity";
ALTER TABLE "new_ServicingActivity" RENAME TO "ServicingActivity";
CREATE INDEX "ServicingActivity_facilityId_idx" ON "ServicingActivity"("facilityId");
CREATE TABLE "new_ServicingAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "servicingActivityId" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServicingAssignment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServicingAssignment_servicingActivityId_fkey" FOREIGN KEY ("servicingActivityId") REFERENCES "ServicingActivity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ServicingAssignment" ("createdAt", "facilityId", "id", "status", "updatedAt") SELECT "createdAt", "facilityId", "id", "status", "updatedAt" FROM "ServicingAssignment";
DROP TABLE "ServicingAssignment";
ALTER TABLE "new_ServicingAssignment" RENAME TO "ServicingAssignment";
CREATE UNIQUE INDEX "ServicingAssignment_servicingActivityId_key" ON "ServicingAssignment"("servicingActivityId");
CREATE INDEX "ServicingAssignment_facilityId_idx" ON "ServicingAssignment"("facilityId");
CREATE INDEX "ServicingAssignment_servicingActivityId_idx" ON "ServicingAssignment"("servicingActivityId");
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransactionHistory_creditAgreementId_fkey" FOREIGN KEY ("creditAgreementId") REFERENCES "CreditAgreement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransactionHistory_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransactionHistory_servicingActivityId_fkey" FOREIGN KEY ("servicingActivityId") REFERENCES "ServicingActivity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TransactionHistory_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TransactionHistory" ("createdAt", "creditAgreementId", "id", "loanId", "servicingActivityId", "tradeId", "updatedAt") SELECT "createdAt", "creditAgreementId", "id", "loanId", "servicingActivityId", "tradeId", "updatedAt" FROM "TransactionHistory";
DROP TABLE "TransactionHistory";
ALTER TABLE "new_TransactionHistory" RENAME TO "TransactionHistory";
CREATE INDEX "TransactionHistory_creditAgreementId_idx" ON "TransactionHistory"("creditAgreementId");
CREATE INDEX "TransactionHistory_loanId_idx" ON "TransactionHistory"("loanId");
CREATE INDEX "TransactionHistory_tradeId_idx" ON "TransactionHistory"("tradeId");
CREATE INDEX "TransactionHistory_servicingActivityId_idx" ON "TransactionHistory"("servicingActivityId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
