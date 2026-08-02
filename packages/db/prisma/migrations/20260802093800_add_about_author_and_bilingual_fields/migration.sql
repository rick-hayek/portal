-- AlterTable
ALTER TABLE "AboutInfo" ADD COLUMN     "title_en" TEXT,
                        ADD COLUMN     "subtitle_en" TEXT,
                        ADD COLUMN     "description_en" TEXT,
                        ADD COLUMN     "author" JSONB;
