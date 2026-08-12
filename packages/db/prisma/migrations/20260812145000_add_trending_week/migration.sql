-- CreateTable
CREATE TABLE IF NOT EXISTS "TrendingWeek" (
    "id" TEXT NOT NULL,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendingWeek_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TrendingWeek_weekOf_key" ON "TrendingWeek"("weekOf");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TrendingWeek_weekOf_idx" ON "TrendingWeek"("weekOf");

-- Seed existing weeks from TrendingRepo into TrendingWeek
INSERT INTO "TrendingWeek" ("id", "weekOf", "createdAt")
SELECT CONCAT('wk_', md5(random()::text)), "weekOf", NOW()
FROM "TrendingRepo"
GROUP BY "weekOf"
ON CONFLICT ("weekOf") DO NOTHING;
