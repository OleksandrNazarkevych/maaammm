/*
  Warnings:

  - You are about to drop the column `supportId` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "supportId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" INTEGER NOT NULL DEFAULT 1;
