import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../trpc';

export const analyticsRouter = router({
    /** Record a page view (public, fire-and-forget) */
    track: publicProcedure
        .input(
            z.object({
                path: z.string().min(1).max(500),
                referrer: z.string().max(1000).optional(),
                userAgent: z.string().max(500).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.prisma.pageView.create({
                data: {
                    path: input.path,
                    referrer: input.referrer,
                    userAgent: input.userAgent,
                },
            });
            return { ok: true };
        }),

    /** Page view summary — admin only */
    summary: adminProcedure
        .input(
            z.object({
                days: z.number().int().min(1).max(365).default(30),
            }).optional(),
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
