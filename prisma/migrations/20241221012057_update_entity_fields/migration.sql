/*
  Warnings:

  - You are about to drop the column `countryOfIncorporation` on the `Entity` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Entity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "legalName" TEXT NOT NULL,
    "dba" TEXT,
    "registrationNumber" TEXT,
    "taxId" TEXT,
    "dateOfBirth" DATETIME,
    "dateOfIncorporation" DATETIME,
    "jurisdiction" TEXT,
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
