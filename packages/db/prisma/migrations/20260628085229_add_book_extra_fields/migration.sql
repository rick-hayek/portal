-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "originalBookId" TEXT,
ADD COLUMN     "publishYear" TEXT;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_originalBookId_fkey" FOREIGN KEY ("originalBookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;
