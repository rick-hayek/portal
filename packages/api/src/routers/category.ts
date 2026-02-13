import { router, publicProcedure } from '../trpc';

export const categoryRouter = router({
    /** List all categories with post count */
    list: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { posts: true } },
            },
        });
    }),
});
