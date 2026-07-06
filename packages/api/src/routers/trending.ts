import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../trpc';

export const trendingRouter = router({
  /** List trending repos for a given week (defaults to latest week) */
  list: publicProcedure
    .input(
      z
        .object({
          weekOf: z.string().optional(), // ISO date string for the Monday
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const defaultLimit = process.env.TRENDING_FETCH_LIMIT
        ? parseInt(process.env.TRENDING_FETCH_LIMIT, 10)
        : 10;
      const limit = input?.limit ?? defaultLimit;

      // If weekOf is specified, use it; otherwise find the latest week
      let targetWeek: Date | undefined;
      if (input?.weekOf) {
        targetWeek = new Date(input.weekOf);
      } else {
        const latest = await ctx.prisma.trendingRepo.findFirst({
          orderBy: { weekOf: 'desc' },
          select: { weekOf: true },
        });
        targetWeek = latest?.weekOf;
      }

      if (!targetWeek) {
        return { repos: [], weekOf: null, totalCount: 0 };
      }

      const [repos, totalCount] = await Promise.all([
        ctx.prisma.trendingRepo.findMany({
          where: { weekOf: targetWeek },
          orderBy: { starsGrowth: 'desc' },
          take: limit,
        }),
        ctx.prisma.trendingRepo.count({
          where: { weekOf: targetWeek },
        }),
      ]);

      return { repos, weekOf: targetWeek.toISOString(), totalCount };
    }),

  /** List all available weeks (for the week switcher dropdown) */
  weeks: publicProcedure.query(async ({ ctx }) => {
    const weeks = await ctx.prisma.trendingRepo.findMany({
      select: { weekOf: true },
      distinct: ['weekOf'],
      orderBy: { weekOf: 'desc' },
      take: 12, // last 12 weeks max
    });
    return weeks.map((w) => w.weekOf.toISOString());
  }),
});
