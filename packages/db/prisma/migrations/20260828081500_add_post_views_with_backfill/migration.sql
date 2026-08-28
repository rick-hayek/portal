-- AlterTable
ALTER TABLE "Post" ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Post_views_idx" ON "Post"("views");

-- Backfill historical view counts from PageView records for each post
UPDATE "Post" p
SET "views" = COALESCE(
  (
    SELECT COUNT(*)::int
    FROM "PageView" pv
    WHERE pv.path = '/blog/' || p.slug
       OR pv.path = '/zh/blog/' || p.slug
       OR pv.path = '/en/blog/' || p.slug
       OR pv.path LIKE '%/blog/' || p.slug || '%'
  ),
  0
);
