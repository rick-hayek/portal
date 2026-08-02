import { publicProcedure, router } from '../trpc';

export const linkRouter = router({
  /** List active links for public display */
  list: publicProcedure.query(async ({ ctx }) => {
    const fetchList = async () => {
      return ctx.prisma.link.findMany({
        where: { isAlive: true, status: 'approved', NOT: { id: 'site-self-link' } },
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      });
    };

    if (ctx.unstable_cache) {
      const getCached = ctx.unstable_cache(
        fetchList,
        ['link-list'],
        { tags: ['links'], revalidate: 3600 }
      );
      return (await getCached()) as Awaited<ReturnType<typeof fetchList>>;
    }
    return fetchList();
  }),

  /** Get site's self link info */
  getSelf: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.link.findUnique({
      where: { id: 'site-self-link' },
    });
  }),
});
