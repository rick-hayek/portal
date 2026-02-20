import { router, publicProcedure } from '../trpc';

export const galleryRouter = router({
    /** List images for the gallery */
    list: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.media.findMany({
            where: { type: 'image' },
            orderBy: { createdAt: 'desc' },
        });
    }),
});
