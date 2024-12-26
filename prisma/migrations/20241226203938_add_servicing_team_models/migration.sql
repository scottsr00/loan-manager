/*
  Warnings:

  - You are about to drop the column `assignedTo` on the `ServicingAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `servicingActivityId` on the `ServicingAssignment` table. All the data in the column will be lost.
  - Added the required column `startDate` to the `ServicingAssignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamMemberId` to the `ServicingAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ServicingRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ServicingTeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServicingTeamMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ServicingRole" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ServicingAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamMemberId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "assignmentType" TEXT NOT NULL DEFAULT 'PRIMARY_AGENT',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServicingAssignment_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "ServicingTeamMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServicingAssignment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ServicingAssignment" ("createdAt", "facilityId", "id", "status", "updatedAt") SELECT "createdAt", "facilityId", "id", "status", "updatedAt" FROM "ServicingAssignment";
DROP TABLE "ServicingAssignment";
ALTER TABLE "new_ServicingAssignment" RENAME TO "ServicingAssignment";
CREATE INDEX "ServicingAssignment_teamMemberId_idx" ON "ServicingAssignment"("teamMemberId");
CREATE INDEX "ServicingAssignment_facilityId_idx" ON "ServicingAssignment"("facilityId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ServicingRole_name_key" ON "ServicingRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServicingTeamMember_email_key" ON "ServicingTeamMember"("email");

-- CreateIndex
CREATE INDEX "ServicingTeamMember_roleId_idx" ON "ServicingTeamMember"("roleId");
