import { publicProcedure, router } from '../trpc';

export const categoryRouter = router({
  /** List all categories with post count */
  list: publicProcedure.query(async ({ ctx }) => {
    const fetchList = async () => {
      return ctx.prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { posts: true } },
        },
      });
    };

    if (ctx.unstable_cache) {
      const getCached = ctx.unstable_cache(
        fetchList,
        ['category-list'],
        { tags: ['categories'], revalidate: 3600 }
      );
      return (await getCached()) as Awaited<ReturnType<typeof fetchList>>;
    }
    return fetchList();
  }),
});
