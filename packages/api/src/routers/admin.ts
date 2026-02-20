import { z } from 'zod';
import { router, adminProcedure, protectedProcedure } from '../trpc';

export const adminRouter = router({
    /** Dashboard stats */
    stats: adminProcedure.query(async ({ ctx }) => {
        const [totalPosts, publishedPosts, totalComments, pendingComments, totalGuestbook, totalViews] =
            await Promise.all([
                ctx.prisma.post.count(),
                ctx.prisma.post.count({ where: { status: 'published' } }),
                ctx.prisma.comment.count(),
                ctx.prisma.comment.count({ where: { status: 'pending' } }),
                ctx.prisma.guestbookEntry.count(),
                ctx.prisma.pageView.count(),
            ]);
        return { totalPosts, publishedPosts, totalComments, pendingComments, totalGuestbook, totalViews };
    }),

    /** Recent comments (for dashboard) */
    recentComments: adminProcedure
        .input(z.object({ limit: z.number().int().min(1).max(20).default(5) }).optional())
        .query(({ ctx, input }) =>
            ctx.prisma.comment.findMany({
                take: input?.limit ?? 5,
                orderBy: { createdAt: 'desc' },
                include: { post: { select: { title: true, slug: true } } },
            }),
        ),

    /** Recent guestbook (for dashboard) */
    recentGuestbook: adminProcedure
        .input(z.object({ limit: z.number().int().min(1).max(20).default(5) }).optional())
        .query(({ ctx, input }) =>
            ctx.prisma.guestbookEntry.findMany({
                take: input?.limit ?? 5,
                orderBy: { createdAt: 'desc' },
            }),
        ),

    // ── Post CRUD ──────────────────────────────────────

    /** List all posts (admin view — includes drafts) */
    postList: adminProcedure
        .input(
            z.object({
                page: z.number().int().min(1).default(1),
                limit: z.number().int().min(1).max(100).default(20),
                status: z.enum(['all', 'draft', 'published']).default('all'),
                search: z.string().optional(),
            }).optional(),
        )
        .query(async ({ ctx, input: rawInput }) => {
            const input = rawInput ?? { page: 1, limit: 20, status: 'all' as const };
            const where: Record<string, unknown> = {};
            if (input.status !== 'all') where.status = input.status;
            if (input.search) {
                where.OR = [
                    { title: { contains: input.search, mode: 'insensitive' } },
                    { content: { contains: input.search, mode: 'insensitive' } },
                ];
            }

            const [items, total] = await Promise.all([
                ctx.prisma.post.findMany({
                    where,
                    skip: (input.page - 1) * input.limit,
                    take: input.limit,
                    orderBy: { updatedAt: 'desc' },
                    include: {
                        category: { select: { name: true } },
                        _count: { select: { comments: true } },
                    },
                }),
                ctx.prisma.post.count({ where }),
            ]);

            return { items, total, page: input.page, totalPages: Math.ceil(total / input.limit) };
        }),

    /** Create post */
    postCreate: adminProcedure
        .input(
            z.object({
                title: z.string().min(1).max(200),
                slug: z.string().min(1).max(200),
                content: z.string().min(1),
                excerpt: z.string().max(500).optional(),
                status: z.enum(['draft', 'published']).default('draft'),
                categoryId: z.string().optional(),
                tagIds: z.array(z.string()).default([]),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.create({
                data: {
                    title: input.title,
                    slug: input.slug,
                    content: input.content,
                    excerpt: input.excerpt,
                    status: input.status,
                    authorId: ctx.user.id,
                    categoryId: input.categoryId,
                    publishedAt: input.status === 'published' ? new Date() : null,
                    tags: {
                        create: input.tagIds.map((tagId) => ({ tagId })),
                    },
                },
                include: { category: true },
            });
            return post;
        }),

    /** Update post */
    postUpdate: adminProcedure
        .input(
            z.object({
                id: z.string(),
                title: z.string().min(1).max(200).optional(),
                slug: z.string().min(1).max(200).optional(),
                content: z.string().min(1).optional(),
                excerpt: z.string().max(500).optional(),
                status: z.enum(['draft', 'published']).optional(),
                categoryId: z.string().nullable().optional(),
                tagIds: z.array(z.string()).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id, tagIds, ...data } = input;

            // Handle publish date
            if (data.status === 'published') {
                const existing = await ctx.prisma.post.findUnique({ where: { id } });
                if (existing && !existing.publishedAt) {
                    (data as Record<string, unknown>).publishedAt = new Date();
                }
            }

            // Update tags if provided
            if (tagIds !== undefined) {
                await ctx.prisma.postTag.deleteMany({ where: { postId: id } });
                await ctx.prisma.postTag.createMany({
                    data: tagIds.map((tagId) => ({ postId: id, tagId })),
                });
            }

            return ctx.prisma.post.update({
                where: { id },
                data,
                include: { category: true },
            });
        }),

    /** Delete post */
    postDelete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) =>
            ctx.prisma.post.delete({ where: { id: input.id } }),
        ),

    // ── Comment Moderation ─────────────────────────────

    /** Update comment status */
    commentModerate: adminProcedure
        .input(
            z.object({
                id: z.string(),
                status: z.enum(['approved', 'spam', 'pending']),
            }),
        )
        .mutation(({ ctx, input }) =>
            ctx.prisma.comment.update({
                where: { id: input.id },
                data: { status: input.status },
            }),
        ),

    /** Delete comment */
    commentDelete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) =>
            ctx.prisma.comment.delete({ where: { id: input.id } }),
        ),

    // ── Guestbook Moderation ───────────────────────────

    /** Delete guestbook entry */
    guestbookDelete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) =>
            ctx.prisma.guestbookEntry.delete({ where: { id: input.id } }),
        ),

    // ── Portfolio CRUD ─────────────────────────────────

    /** List all projects (admin) */
    projectList: adminProcedure.query(({ ctx }) =>
        ctx.prisma.project.findMany({
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        }),
    ),

    /** Create project */
    projectCreate: adminProcedure
        .input(
            z.object({
                title: z.string().min(1).max(200),
                slug: z.string().min(1).max(200),
                description: z.string().min(1),
                coverImage: z.string().optional(),
                liveUrl: z.string().optional(),
                repoUrl: z.string().optional(),
                techStack: z.array(z.string()).default([]),
                sortOrder: z.number().int().default(0),
                featured: z.boolean().default(false),
            }),
        )
        .mutation(({ ctx, input }) =>
            ctx.prisma.project.create({ data: input }),
        ),

    /** Update project */
    projectUpdate: adminProcedure
        .input(
            z.object({
                id: z.string(),
                title: z.string().min(1).max(200).optional(),
                slug: z.string().min(1).max(200).optional(),
                description: z.string().min(1).optional(),
                coverImage: z.string().nullable().optional(),
                liveUrl: z.string().nullable().optional(),
                repoUrl: z.string().nullable().optional(),
                techStack: z.array(z.string()).optional(),
                sortOrder: z.number().int().optional(),
                featured: z.boolean().optional(),
            }),
        )
        .mutation(({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.project.update({ where: { id }, data });
        }),

    /** Delete project */
    projectDelete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) =>
            ctx.prisma.project.delete({ where: { id: input.id } }),
        ),

    // ── Links CRUD ─────────────────────────────────

    /** List all links (admin) */
    linkList: adminProcedure.query(({ ctx }) =>
        ctx.prisma.link.findMany({
            orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        }),
    ),

    /** Create link */
    linkCreate: adminProcedure
        .input(
            z.object({
                name: z.string().min(1).max(200),
                url: z.string().url(),
                avatar: z.string().url().optional().or(z.literal('')),
                description: z.string().optional().or(z.literal('')),
                category: z.string().default('default'),
                isAlive: z.boolean().default(true),
                sortOrder: z.number().int().default(0),
            }),
        )
        .mutation(({ ctx, input }) => ctx.prisma.link.create({
            data: {
                ...input,
                avatar: input.avatar || null,
                description: input.description || null,
            }
        })),

    /** Update link */
    linkUpdate: adminProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1).max(200).optional(),
                url: z.string().url().optional(),
                avatar: z.string().url().nullable().optional().or(z.literal('')),
                description: z.string().nullable().optional().or(z.literal('')),
                category: z.string().optional(),
                isAlive: z.boolean().optional(),
                sortOrder: z.number().int().optional(),
            }),
        )
        .mutation(({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.link.update({
                where: { id },
                data: {
                    ...data,
                    avatar: data.avatar === '' ? null : data.avatar,
                    description: data.description === '' ? null : data.description,
                }
            });
        }),

    /** Delete link */
    linkDelete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => ctx.prisma.link.delete({ where: { id: input.id } })),

    // ── Site Settings ──────────────────────────────────

    /** Get a site config value */
    configGet: adminProcedure
        .input(z.object({ key: z.string() }))
        .query(({ ctx, input }) =>
            ctx.prisma.siteConfig.findUnique({ where: { key: input.key } }),
        ),

    /** Set a site config value */
    configSet: adminProcedure
        .input(z.object({ key: z.string(), value: z.any() }))
        .mutation(({ ctx, input }) =>
            ctx.prisma.siteConfig.upsert({
                where: { key: input.key },
                update: { value: input.value },
                create: { key: input.key, value: input.value },
            }),
        ),

    /** List all config entries */
    configList: adminProcedure.query(({ ctx }) =>
        ctx.prisma.siteConfig.findMany({ orderBy: { key: 'asc' } }),
    ),
});
