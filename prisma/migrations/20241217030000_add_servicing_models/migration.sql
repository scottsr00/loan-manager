-- CreateTable
CREATE TABLE "ServicingActivity" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "facilityId" TEXT NOT NULL,
  "activityType" TEXT NOT NULL,
  "dueDate" DATETIME NOT NULL,
  "amount" REAL NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "completedAt" DATETIME,
  "completedBy" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "ServicingActivity_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ServicingActivity_facilityId_idx" ON "ServicingActivity"("facilityId");
CREATE INDEX "ServicingActivity_dueDate_idx" ON "ServicingActivity"("dueDate");
CREATE INDEX "ServicingActivity_status_idx" ON "ServicingActivity"("status"); 