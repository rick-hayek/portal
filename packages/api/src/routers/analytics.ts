import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from '../trpc';

export const analyticsRouter = router({
  /** Record page views in batches (public, fire-and-forget) */
  track: publicProcedure
    .input(
      z.array(
        z.object({
          path: z.string().min(1).max(500),
          referrer: z.string().max(1000).optional(),
          userAgent: z.string().max(500).optional(),
          createdAt: z.string().optional(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.length === 0) return { ok: true };

      await ctx.prisma.pageView.createMany({
        data: input.map((item) => ({
          path: item.path,
          referrer: item.referrer,
          userAgent: item.userAgent,
          createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        })),
      });

      // Extract blog post slugs and increment Post.views
      const blogSlugs: string[] = [];
      for (const item of input) {
        const match = item.path.match(/^(?:\/(?:zh|en))?\/blog\/([a-zA-Z0-9_-]+)/);
        if (match?.[1]) {
          blogSlugs.push(match[1]);
        }
      }

      if (blogSlugs.length > 0) {
        const counts: Record<string, number> = {};
        for (const slug of blogSlugs) {
          counts[slug] = (counts[slug] || 0) + 1;
        }

        await Promise.allSettled(
          Object.entries(counts).map(([slug, count]) =>
            ctx.prisma.post.updateMany({
              where: { slug },
              data: { views: { increment: count } },
            }),
          ),
        );
      }

      return { ok: true };
    }),

  /** Page view summary — admin only */
  summary: adminProcedure
    .input(
      z
        .object({
          days: z.number().int().min(1).max(365).default(30),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 30;
      const since = new Date();
      since.setDate(since.getDate() - days);

      const [totalViews, recentViews, topPages, viewsByDay] = await Promise.all([
        ctx.prisma.pageView.count(),
        ctx.prisma.pageView.count({ where: { createdAt: { gte: since } } }),
        ctx.prisma.$queryRaw`
                    SELECT path, COUNT(*)::int AS views
                    FROM "PageView"
                    WHERE "createdAt" >= ${since}
                    GROUP BY path
                    ORDER BY views DESC
                    LIMIT 10
                ` as Promise<{ path: string; views: number }[]>,
        ctx.prisma.$queryRaw`
                    SELECT DATE("createdAt") AS date, COUNT(*)::int AS views
                    FROM "PageView"
                    WHERE "createdAt" >= ${since}
                    GROUP BY DATE("createdAt")
                    ORDER BY date ASC
                ` as Promise<{ date: string; views: number }[]>,
      ]);

      return { totalViews, recentViews, days, topPages, viewsByDay };
    }),
});
