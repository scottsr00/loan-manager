/*
  Warnings:

  - You are about to drop the `LoanPosition` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `share` to the `FacilityPosition` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "LoanPosition_lenderId_idx";

-- DropIndex
DROP INDEX "LoanPosition_loanId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LoanPosition";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FacilityPosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "share" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FacilityPosition_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FacilityPosition_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FacilityPosition" ("amount", "createdAt", "facilityId", "id", "lenderId", "status", "updatedAt") SELECT "amount", "createdAt", "facilityId", "id", "lenderId", "status", "updatedAt" FROM "FacilityPosition";
DROP TABLE "FacilityPosition";
ALTER TABLE "new_FacilityPosition" RENAME TO "FacilityPosition";
CREATE INDEX "FacilityPosition_facilityId_idx" ON "FacilityPosition"("facilityId");
CREATE INDEX "FacilityPosition_lenderId_idx" ON "FacilityPosition"("lenderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
