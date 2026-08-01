import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const postRouter = router({
  /** Paginated post list with optional category/tag filters */
  list: publicProcedure
    .input(
      z
        .object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(50).default(10),
          categorySlug: z.string().optional(),
          tagSlug: z.string().optional(),
          status: z.enum(['draft', 'published']).default('published'),
        })
        .default({ page: 1, limit: 10, status: 'published' as const }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, categorySlug, tagSlug, status } = input;
      const skip = (page - 1) * limit;

      const where = {
        status,
        ...(categorySlug && { category: { slug: categorySlug } }),
        ...(tagSlug && { tags: { some: { tag: { slug: tagSlug } } } }),
      };

      const fetchQuery = async () => {
        const [posts, total] = await Promise.all([
          ctx.prisma.post.findMany({
            where,
            skip,
            take: limit,
            orderBy: { publishedAt: 'desc' },
            include: {
              author: { select: { id: true, name: true, image: true } },
              category: { select: { id: true, name: true, name_en: true, slug: true } },
              tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
            },
          }),
          ctx.prisma.post.count({ where }),
        ]);
        return { posts, total };
      };

      let result;
      if (ctx.unstable_cache) {
        const getCached = ctx.unstable_cache(
          async (p: number, l: number, cSlug?: string, tSlug?: string, st?: string) => {
            return fetchQuery();
          },
          ['post-list'],
          { tags: ['posts'], revalidate: 3600 }
        );
        result = (await getCached(page, limit, categorySlug, tagSlug, status)) as Awaited<ReturnType<typeof fetchQuery>>;
      } else {
        result = await fetchQuery();
      }

      return {
        posts: result.posts,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };
    }),

  /** Get a single post by slug */
  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const fetchPost = async (s: string) => {
      return ctx.prisma.post.findUnique({
        where: { slug: s, status: 'published' },
        include: {
          author: { select: { id: true, name: true, image: true } },
          category: { select: { id: true, name: true, name_en: true, slug: true } },
          tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
          comments: {
            where: { status: 'approved', parentId: null },
            orderBy: { createdAt: 'desc' },
            include: {
              replies: {
                where: { status: 'approved' },
                orderBy: { createdAt: 'asc' },
              },
            },
          },
        },
      });
    };

    if (ctx.unstable_cache) {
      const getCached = ctx.unstable_cache(
        fetchPost,
        ['post-by-slug'],
        { tags: ['posts'], revalidate: 3600 }
      );
      return (await getCached(input.slug)) as Awaited<ReturnType<typeof fetchPost>>;
    }
    return fetchPost(input.slug);
  }),

  /** Get N most recent published posts (for homepage) */
  recent: publicProcedure
    .input(z.object({ count: z.number().int().min(1).max(20).default(5) }).default({ count: 5 }))
    .query(async ({ ctx, input }) => {
      const fetchRecent = async (c: number) => {
        return ctx.prisma.post.findMany({
          where: { status: 'published' },
          take: c,
          orderBy: { publishedAt: 'desc' },
          include: {
            author: { select: { id: true, name: true, image: true } },
            category: { select: { id: true, name: true, name_en: true, slug: true } },
          },
        });
      };

      if (ctx.unstable_cache) {
        const getCached = ctx.unstable_cache(
          fetchRecent,
          ['post-recent'],
          { tags: ['posts'], revalidate: 3600 }
        );
        return (await getCached(input.count)) as Awaited<ReturnType<typeof fetchRecent>>;
      }
      return fetchRecent(input.count);
    }),
});
