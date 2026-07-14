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

      const fetchTargetWeek = async (wOf?: string) => {
        if (wOf) {
          return new Date(wOf);
        }
        const latest = await ctx.prisma.trendingRepo.findFirst({
          orderBy: { weekOf: 'desc' },
          select: { weekOf: true },
        });
        return latest?.weekOf;
      };

      const fetchRepos = async (targetWeek: Date, lim: number) => {
        const [repos, totalCount] = await Promise.all([
          ctx.prisma.trendingRepo.findMany({
            where: { weekOf: targetWeek },
            orderBy: { starsGrowth: 'desc' },
            take: lim,
          }),
          ctx.prisma.trendingRepo.count({
            where: { weekOf: targetWeek },
          }),
        ]);
        return { repos, totalCount };
      };

      const fetchQuery = async (lim: number, wOf?: string) => {
        const targetWeek = await fetchTargetWeek(wOf);
        if (!targetWeek) {
          return { repos: [], weekOf: null, totalCount: 0 };
        }
        const { repos, totalCount } = await fetchRepos(targetWeek, lim);
        return { repos, weekOf: targetWeek.toISOString(), totalCount };
      };

      if (ctx.unstable_cache) {
        const getCached = ctx.unstable_cache(
          async (lim: number, wOf?: string) => {
            return fetchQuery(lim, wOf);
          },
          ['trending-list'],
          { tags: ['trending'], revalidate: 3600 }
        );
        return (await getCached(limit, input?.weekOf)) as Awaited<ReturnType<typeof fetchQuery>>;
      }
      return fetchQuery(limit, input?.weekOf);
    }),

  /** List all available weeks (for the week switcher dropdown) */
  weeks: publicProcedure.query(async ({ ctx }) => {
    const fetchWeeks = async () => {
      const weeks = await ctx.prisma.trendingRepo.findMany({
        select: { weekOf: true },
        distinct: ['weekOf'],
        orderBy: { weekOf: 'desc' },
        take: 12, // last 12 weeks max
      });
      return weeks.map((w) => w.weekOf.toISOString());
    };

    if (ctx.unstable_cache) {
      const getCached = ctx.unstable_cache(
        fetchWeeks,
        ['trending-weeks'],
        { tags: ['trending'], revalidate: 3600 }
      );
      return (await getCached()) as Awaited<ReturnType<typeof fetchWeeks>>;
    }
    return fetchWeeks();
  }),
});
