/*
  Warnings:

  - You are about to drop the column `typeId` on the `Counterparty` table. All the data in the column will be lost.
  - You are about to drop the `CounterpartyType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Counterparty" DROP CONSTRAINT "Counterparty_typeId_fkey";

-- DropIndex
DROP INDEX "Counterparty_typeId_idx";

-- AlterTable
ALTER TABLE "Counterparty" DROP COLUMN "typeId";

-- DropTable
DROP TABLE "CounterpartyType";
