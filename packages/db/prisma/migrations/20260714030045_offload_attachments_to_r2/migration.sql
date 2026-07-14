/*
  Warnings:

  - You are about to drop the column `fileData` on the `Attachment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "fileData",
ADD COLUMN     "url" TEXT NOT NULL DEFAULT '';
