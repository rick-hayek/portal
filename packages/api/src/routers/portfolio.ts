import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const portfolioRouter = router({
  /** List published projects */
  list: publicProcedure
    .input(
      z
        .object({
          tech: z.string().optional(),
          featured: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const fetchList = async (t?: string, f?: boolean) => {
        const queryWhere: Record<string, unknown> = {};
        if (t) {
          queryWhere.techStack = { has: t };
        }
        if (f) {
          queryWhere.featured = true;
        }
        return ctx.prisma.project.findMany({
          where: queryWhere,
          orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
      };

      if (ctx.unstable_cache) {
        const getCached = ctx.unstable_cache(
          async (t?: string, f?: boolean) => {
            return fetchList(t, f);
          },
          ['portfolio-list'],
          { tags: ['projects'], revalidate: 3600 },
        );
        return (await getCached(input?.tech, input?.featured)) as Awaited<
          ReturnType<typeof fetchList>
        >;
      }
      return fetchList(input?.tech, input?.featured);
    }),

  /** Single project by slug */
  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const fetchProject = async (s: string) => {
      return ctx.prisma.project.findUnique({ where: { slug: s } });
    };

    if (ctx.unstable_cache) {
      const getCached = ctx.unstable_cache(fetchProject, ['portfolio-by-slug'], {
        tags: ['projects'],
        revalidate: 3600,
      });
      return (await getCached(input.slug)) as Awaited<ReturnType<typeof fetchProject>>;
    }
    return fetchProject(input.slug);
  }),

  /** All unique tech stack values (for filter UI) */
  techStacks: publicProcedure.query(async ({ ctx }) => {
    const fetchTechStacks = async () => {
      const projects = await ctx.prisma.project.findMany({
        select: { techStack: true },
      });
      const all = projects.flatMap((p) => p.techStack);
      return [...new Set(all)].sort();
    };

    if (ctx.unstable_cache) {
      const getCached = ctx.unstable_cache(fetchTechStacks, ['portfolio-tech-stacks'], {
        tags: ['projects'],
        revalidate: 3600,
      });
      return (await getCached()) as Awaited<ReturnType<typeof fetchTechStacks>>;
    }
    return fetchTechStacks();
  }),
});
