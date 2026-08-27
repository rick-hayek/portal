import { z } from 'zod';
import { adminProcedure, router } from '../../trpc';

export const adminStatsRouter = router({
  /** Dashboard stats */
  stats: adminProcedure.query(async ({ ctx }) => {
    const [totalPosts, publishedPosts, totalComments, pendingComments, totalGuestbook, totalViews] =
      await Promise.all([
        ctx.prisma.post.count(),
        ctx.prisma.post.count({ where: { status: 'published' } }),
        ctx.prisma.comment.count(),
        ctx.prisma.comment.count({ where: { status: 'pending' } }),
        ctx.prisma.guestbookEntry.count(),
        ctx.prisma.pageView.count(),
      ]);
    return {
      totalPosts,
      publishedPosts,
      totalComments,
      pendingComments,
      totalGuestbook,
      totalViews,
    };
  }),

  /** Recent comments (for dashboard) */
  recentComments: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(5) }).optional())
    .query(({ ctx, input }) =>
      ctx.prisma.comment.findMany({
        take: input?.limit ?? 5,
        orderBy: { createdAt: 'desc' },
        include: { post: { select: { title: true, slug: true } } },
      }),
    ),

  /** Recent guestbook (for dashboard) */
  recentGuestbook: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(5) }).optional())
    .query(({ ctx, input }) =>
      ctx.prisma.guestbookEntry.findMany({
        take: input?.limit ?? 5,
        orderBy: { createdAt: 'desc' },
      }),
    ),
});
