/*
  Warnings:

  - You are about to drop the column `newOutstandingAmount` on the `LenderPositionHistory` table. All the data in the column will be lost.
  - You are about to drop the column `previousOutstandingAmount` on the `LenderPositionHistory` table. All the data in the column will be lost.
  - Added the required column `newCommitmentAmount` to the `LenderPositionHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newDrawnAmount` to the `LenderPositionHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newUndrawnAmount` to the `LenderPositionHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previousCommitmentAmount` to the `LenderPositionHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previousDrawnAmount` to the `LenderPositionHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previousUndrawnAmount` to the `LenderPositionHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LenderPositionHistory" DROP COLUMN "newOutstandingAmount",
DROP COLUMN "previousOutstandingAmount",
ADD COLUMN     "newCommitmentAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "newDrawnAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "newUndrawnAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "previousCommitmentAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "previousDrawnAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "previousUndrawnAmount" DOUBLE PRECISION NOT NULL;
