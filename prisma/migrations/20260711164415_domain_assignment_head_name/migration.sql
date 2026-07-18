/*
  Warnings:

  - You are about to drop the column `userId` on the `DomainAssignment` table. All the data in the column will be lost.
  - Added the required column `headName` to the `DomainAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DomainAssignment" DROP CONSTRAINT "DomainAssignment_userId_fkey";

-- AlterTable
ALTER TABLE "DomainAssignment" DROP COLUMN "userId",
ADD COLUMN     "headName" TEXT NOT NULL;
