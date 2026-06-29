/*
  Warnings:

  - Added the required column `slug` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "originalBookId" TEXT,
ADD COLUMN     "publishYear" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_originalBookId_fkey" FOREIGN KEY ("originalBookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;
