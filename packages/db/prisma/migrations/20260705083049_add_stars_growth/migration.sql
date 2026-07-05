-- AlterTable
ALTER TABLE "TrendingRepo" ADD COLUMN     "starsGrowth" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "TrendingRepo_starsGrowth_idx" ON "TrendingRepo"("starsGrowth");
