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
    "countryOfIncorporation" TEXT,
    "governmentId" TEXT,
    "governmentIdType" TEXT,
    "governmentIdExpiry" DATETIME,
    "primaryContactName" TEXT,
    "primaryContactEmail" TEXT,
    "primaryContactPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isAgent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Entity" ("countryOfIncorporation", "createdAt", "dateOfBirth", "dateOfIncorporation", "dba", "governmentId", "governmentIdExpiry", "governmentIdType", "id", "legalName", "primaryContactEmail", "primaryContactName", "primaryContactPhone", "registrationNumber", "status", "taxId", "updatedAt") SELECT "countryOfIncorporation", "createdAt", "dateOfBirth", "dateOfIncorporation", "dba", "governmentId", "governmentIdExpiry", "governmentIdType", "id", "legalName", "primaryContactEmail", "primaryContactName", "primaryContactPhone", "registrationNumber", "status", "taxId", "updatedAt" FROM "Entity";
DROP TABLE "Entity";
ALTER TABLE "new_Entity" RENAME TO "Entity";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
