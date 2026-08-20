-- AlterTable
ALTER TABLE "Comment" ADD COLUMN "locale" TEXT DEFAULT 'zh';

-- AlterTable
ALTER TABLE "Link" ADD COLUMN "locale" TEXT DEFAULT 'zh';
