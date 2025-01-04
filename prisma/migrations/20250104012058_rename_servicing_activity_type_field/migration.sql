/*
  Warnings:

  - You are about to drop the column `type` on the `ServicingActivity` table. All the data in the column will be lost.
  - Added the required column `activityType` to the `ServicingActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServicingActivity" DROP COLUMN "type",
ADD COLUMN     "activityType" TEXT NOT NULL;
