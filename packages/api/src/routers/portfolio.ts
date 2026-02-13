import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const portfolioRouter = router({
    /** List published projects */
    list: publicProcedure
        .input(
            z.object({
                tech: z.string().optional(),
                featured: z.boolean().optional(),
            }).optional(),
        )
        .query(async ({ ctx, input }) => {
            const where: Record<string, unknown> = {};
            if (input?.tech) {
                where.techStack = { has: input.tech };
            }
            if (input?.featured) {
                where.featured = true;
            }

            return ctx.prisma.project.findMany({
                where,
                orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
            });
        }),

    /** Single project by slug */
    bySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(({ ctx, input }) =>
            ctx.prisma.project.findUnique({ where: { slug: input.slug } }),
        ),

    /** All unique tech stack values (for filter UI) */
    techStacks: publicProcedure.query(async ({ ctx }) => {
        const projects = await ctx.prisma.project.findMany({
            select: { techStack: true },
        });
        const all = projects.flatMap((p) => p.techStack);
        return [...new Set(all)].sort();
    }),
});
