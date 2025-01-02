/*
  Warnings:

  - You are about to drop the column `amount` on the `FacilityPosition` table. All the data in the column will be lost.
  - Added the required column `commitmentAmount` to the `FacilityPosition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `undrawnAmount` to the `FacilityPosition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FacilityPosition" DROP COLUMN "amount",
ADD COLUMN     "commitmentAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "drawnAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "undrawnAmount" DOUBLE PRECISION NOT NULL;
