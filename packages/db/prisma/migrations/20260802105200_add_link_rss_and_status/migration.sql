-- AlterTable
ALTER TABLE "Link" ADD COLUMN "rss" TEXT,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'approved',
ADD COLUMN "screenshot" TEXT;
