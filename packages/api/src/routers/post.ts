import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const postRouter = router({
    /** Paginated post list with optional category/tag filters */
    list: publicProcedure
        .input(
            z.object({
                page: z.number().int().min(1).default(1),
                limit: z.number().int().min(1).max(50).default(10),
                categorySlug: z.string().optional(),
                tagSlug: z.string().optional(),
                status: z.enum(['draft', 'published']).default('published'),
            }).default({ page: 1, limit: 10, status: 'published' as const }),
        )
        .query(async ({ ctx, input }) => {
            const { page, limit, categorySlug, tagSlug, status } = input;
            const skip = (page - 1) * limit;

            const where = {
                status,
                ...(categorySlug && { category: { slug: categorySlug } }),
                ...(tagSlug && { tags: { some: { tag: { slug: tagSlug } } } }),
            };

            const [posts, total] = await Promise.all([
                ctx.prisma.post.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { publishedAt: 'desc' },
                    include: {
                        author: { select: { id: true, name: true, image: true } },
                        category: { select: { id: true, name: true, slug: true } },
                        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
                    },
                }),
                ctx.prisma.post.count({ where }),
            ]);

            return {
                posts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }),

    /** Get a single post by slug */
    bySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.findUnique({
                where: { slug: input.slug, status: 'published' },
                include: {
                    author: { select: { id: true, name: true, image: true } },
                    category: { select: { id: true, name: true, slug: true } },
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

            return post;
        }),

    /** Get N most recent published posts (for homepage) */
    recent: publicProcedure
        .input(z.object({ count: z.number().int().min(1).max(20).default(5) }).default({ count: 5 }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.post.findMany({
                where: { status: 'published' },
                take: input.count,
                orderBy: { publishedAt: 'desc' },
                include: {
                    author: { select: { id: true, name: true, image: true } },
                    category: { select: { id: true, name: true, slug: true } },
                },
            });
        }),
});
