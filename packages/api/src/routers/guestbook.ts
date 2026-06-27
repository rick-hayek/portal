import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const guestbookRouter = router({
  /** List guestbook entries (paginated, newest first) */
  list: publicProcedure
    .input(
      z
        .object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(50).default(20),
        })
        .default({ page: 1, limit: 20 }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const [entries, total] = await Promise.all([
        ctx.prisma.guestbookEntry.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.guestbookEntry.count(),
      ]);

      return {
        entries,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    }),

  /** Submit a new guestbook entry */
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.guestbookEntry.create({
        data: {
          authorName: ctx.user.name ?? 'Anonymous',
          content: input.content,
          avatar: ctx.user.image ?? null,
        },
      });
    }),
});
