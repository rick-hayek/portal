import { z } from 'zod';
import { adminProcedure, router } from '../../trpc';

export const adminTrendingRouter = router({
  /** Fetch trending AI/LLM repos from GitHub for the current week */
  trendingFetch: adminProcedure.mutation(async ({ ctx }) => {
    try {
      // Calculate the Monday of this week
      const now = new Date();
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1; // Monday = 0 offset
      const monday = new Date(now);
      monday.setDate(now.getDate() - diff);
      monday.setHours(0, 0, 0, 0);

      // Monday of last week to compute star growth delta
      const lastMonday = new Date(monday);
      lastMonday.setDate(monday.getDate() - 7);
      lastMonday.setHours(0, 0, 0, 0);

      // 180 days ago for the search query (to capture recently created trending projects)
      const halfYearAgo = new Date(now);
      halfYearAgo.setDate(now.getDate() - 180);
      const dateStr = halfYearAgo.toISOString().split('T')[0];

      // Build GitHub Search API request with advanced OR query terms split to respect OR limitations
      const searchTerms1 = [
        'ai',
        'llm',
        '"large language model"',
        '"generative ai"',
        '"generative-ai"',
      ].join(' OR ');

      const searchTerms2 = [
        '"ai agent"',
        '"ai-agent"',
        '"agentic ai"',
        '"agentic-ai"',
        '"agent harness"',
      ].join(' OR ');

      const searchTerms3 = ['"openai"', '"anthropic"', '"gemini"', '"grok"', '"llama"'].join(
        ' OR ',
      );

      const searchTerms4 = ['"claude"', '"qwen"', '"deepseek"', '"agentic"', '"glm"'].join(' OR ');

      const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Portal-Trending-Bot',
      };
      const token = process.env.GITHUB_TOKEN;
      if (token && !token.startsWith('your_')) {
        headers.Authorization = `Bearer ${token}`;
      }

      interface GithubRepo {
        id: number;
        name: string;
        full_name: string;
        html_url: string;
        description: string | null;
        language: string | null;
        stargazers_count: number;
        forks_count: number;
        created_at: string;
        topics: string[];
      }

      const fetchRepos = async (searchTerms: string): Promise<GithubRepo[]> => {
        const query = `${searchTerms} created:>${dateStr}`;
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100`;
        console.log(`[GitHub API] Fetching from: ${url}`);
        const res = await fetch(url, { headers });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`GitHub API error ${res.status}: ${text}`);
        }
        const data = (await res.json()) as { items: GithubRepo[] };
        return data.items ?? [];
      };

      const [repos1, repos2, repos3, repos4] = await Promise.all([
        fetchRepos(searchTerms1),
        fetchRepos(searchTerms2),
        fetchRepos(searchTerms3),
        fetchRepos(searchTerms4),
      ]);

      // Merge and deduplicate by GitHub ID
      const mergedMap = new Map<number, GithubRepo>();
      for (const r of [...repos1, ...repos2, ...repos3, ...repos4]) {
        mergedMap.set(r.id, r);
      }

      // Sort by stargazers_count desc and take top 100
      const finalItems = Array.from(mergedMap.values())
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 100);

      console.log(
        `[GitHub API] Successfully retrieved and merged ${finalItems.length} candidate repositories.`,
      );

      let upsertCount = 0;
      for (const repo of finalItems) {
        // Find last week's star count to calculate starsGrowth
        const lastWeekRecord = await ctx.prisma.trendingRepo.findUnique({
          where: {
            githubId_weekOf: {
              githubId: repo.id,
              weekOf: lastMonday,
            },
          },
          select: { stars: true },
        });

        let growth = 0;
        if (lastWeekRecord) {
          growth = repo.stargazers_count - lastWeekRecord.stars;
        } else {
          // Fallback: estimate growth based on total stars divided by age in days times 7
          const createdDate = new Date(repo.created_at);
          const daysOld = Math.max(
            1,
            Math.round((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)),
          );
          const weekDays = daysOld > 7 ? 7 : daysOld;
          growth = Math.round((repo.stargazers_count / daysOld) * weekDays);
        }

        growth = Math.max(0, growth);

        await ctx.prisma.trendingRepo.upsert({
          where: {
            githubId_weekOf: {
              githubId: repo.id,
              weekOf: monday,
            },
          },
          update: {
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            starsGrowth: growth,
            description: repo.description,
            topics: repo.topics ?? [],
          },
          create: {
            githubId: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            url: repo.html_url,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            starsGrowth: growth,
            repoCreatedAt: new Date(repo.created_at),
            topics: repo.topics ?? [],
            weekOf: monday,
          },
        });
        upsertCount++;
      }

      // Upsert current week into TrendingWeek table
      await ctx.prisma.trendingWeek.upsert({
        where: { weekOf: monday },
        update: {},
        create: { weekOf: monday },
      });

      if (ctx.revalidateTag) {
        ctx.revalidateTag('trending');
      }
      return { success: true, count: upsertCount, weekOf: monday.toISOString() };
    } catch (error: any) {
      console.error('[adminRouter.trendingFetch] Error fetching/saving trending repos:', error);
      throw error;
    }
  }),

  /** Update trending repo summaries */
  trendingUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        summaryZh: z.string().optional(),
        summaryEn: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await ctx.prisma.trendingRepo.update({
        where: { id: input.id },
        data: {
          summaryZh: input.summaryZh,
          summaryEn: input.summaryEn,
        },
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('trending');
      }
      return repo;
    }),

  /** List all trending repos for admin management (with pagination) */
  trendingList: adminProcedure
    .input(
      z
        .object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(20),
          weekOf: z.string().optional(),
        })
        .default({ page: 1, limit: 20 }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      let targetWeek: Date | undefined;
      if (input.weekOf) {
        targetWeek = new Date(input.weekOf);
      } else {
        const latest = await ctx.prisma.trendingRepo.findFirst({
          orderBy: { weekOf: 'desc' },
          select: { weekOf: true },
        });
        targetWeek = latest?.weekOf;
      }

      if (!targetWeek) {
        return { repos: [], total: 0, totalPages: 0, weekOf: null };
      }

      const [repos, total] = await Promise.all([
        ctx.prisma.trendingRepo.findMany({
          where: { weekOf: targetWeek },
          orderBy: { starsGrowth: 'desc' },
          skip,
          take: limit,
        }),
        ctx.prisma.trendingRepo.count({
          where: { weekOf: targetWeek },
        }),
      ]);

      return {
        repos,
        total,
        totalPages: Math.ceil(total / limit),
        weekOf: targetWeek.toISOString(),
      };
    }),

  /** Delete a trending repo by ID */
  trendingDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const repo = await ctx.prisma.trendingRepo.delete({
        where: { id: input.id },
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('trending');
      }
      return repo;
    }),

  /** Invalidate server cache for trending repos */
  trendingCacheRefresh: adminProcedure.mutation(async ({ ctx }) => {
    if (ctx.revalidateTag) {
      ctx.revalidateTag('trending');
      return { success: true };
    }
    return { success: false, message: 'Revalidation function not available' };
  }),
});
