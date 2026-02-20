import { router, publicProcedure } from '../trpc';

export const linkRouter = router({
    /** List active links for public display */
    list: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.link.findMany({
            where: { isAlive: true },
            orderBy: [
                { category: 'asc' },
                { sortOrder: 'asc' },
            ],
        });
    }),
});
