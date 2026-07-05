-- CreateTable
CREATE TABLE "TrendingRepo" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT,
    "stars" INTEGER NOT NULL,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "repoCreatedAt" TIMESTAMP(3) NOT NULL,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summaryZh" TEXT,
    "summaryEn" TEXT,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrendingRepo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrendingRepo_weekOf_idx" ON "TrendingRepo"("weekOf");

-- CreateIndex
CREATE INDEX "TrendingRepo_stars_idx" ON "TrendingRepo"("stars");

-- CreateIndex
CREATE UNIQUE INDEX "TrendingRepo_githubId_weekOf_key" ON "TrendingRepo"("githubId", "weekOf");
