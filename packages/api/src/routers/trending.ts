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

  /** Get GitHub repo IDs starred by the current authenticated user */
  getMyStarredRepoIds: protectedProcedure.query(async ({ ctx }) => {
    const account = await ctx.prisma.account.findFirst({
      where: {
        userId: ctx.user.id,
        provider: 'github',
      },
      select: { access_token: true },
    });

    if (!account?.access_token) {
      return [];
    }

    try {
      const res = await fetch('https://api.github.com/user/starred?per_page=100', {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${account.access_token}`,
          'User-Agent': 'Portal-Client',
        },
      });

      if (!res.ok) {
        console.error(`[GitHub Star Fetch] Error ${res.status}: ${await res.text()}`);
        return [];
      }

      const data = (await res.json()) as Array<{ id: number }>;
      return data.map((repo) => repo.id);
    } catch (error) {
      console.error('[GitHub Star Fetch] Failed to fetch starred repos:', error);
      return [];
    }
  }),

  /** Star or unstar a repository on GitHub on behalf of the user */
  toggleStar: protectedProcedure
    .input(
      z.object({
        fullName: z.string(),
        starred: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.prisma.account.findFirst({
        where: {
          userId: ctx.user.id,
          provider: 'github',
        },
        select: { access_token: true },
      });

      if (!account?.access_token) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'GitHub account not linked or access token not found',
        });
      }

      const method = input.starred ? 'PUT' : 'DELETE';
      const url = `https://api.github.com/user/starred/${input.fullName}`;

      try {
        const res = await fetch(url, {
          method,
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${account.access_token}`,
            'User-Agent': 'Portal-Client',
            'Content-Length': '0',
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `GitHub API returned ${res.status}: ${text}`,
          });
        }

        return { success: true };
      } catch (error: any) {
        console.error('[GitHub Star Toggle] Failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to toggle star',
        });
      }
    }),
});
