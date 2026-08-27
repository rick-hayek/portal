import { z } from 'zod';
import { ensurePostsIndex, indexPost, removePostFromIndex } from '../../search';
import { adminProcedure, router } from '../../trpc';

export const adminPostRouter = router({
  /** List all posts (admin view — includes drafts) */
  postList: adminProcedure
    .input(
      z
        .object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(20),
          status: z.enum(['all', 'draft', 'published']).default('all'),
          search: z.string().optional(),
        })
        .optional(),
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

      if (post.status === 'published') {
        try {
          await ensurePostsIndex();
          await indexPost(post);
        } catch (e) {
          console.error('Failed to index post in MeiliSearch:', e);
        }
      }

      if (ctx.revalidateTag) {
        ctx.revalidateTag('posts');
        ctx.revalidateTag('categories');
      }

      return post;
    }),

  /** Get post by ID */
  postGet: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const post = await ctx.prisma.post.findUnique({
      where: { id: input.id },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
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

      const updatedPost = await ctx.prisma.post.update({
        where: { id },
        data,
        include: { category: true },
      });

      // Sync to MeiliSearch
      try {
        await ensurePostsIndex();
        if (updatedPost.status === 'published') {
          await indexPost(updatedPost);
        } else {
          await removePostFromIndex(updatedPost.id);
        }
      } catch (e) {
        console.error('Failed to sync post in MeiliSearch:', e);
      }

      if (ctx.revalidateTag) {
        ctx.revalidateTag('posts');
        ctx.revalidateTag('categories');
      }

      return updatedPost;
    }),

  /** Delete post */
  postDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.delete({ where: { id: input.id } });
      try {
        await removePostFromIndex(input.id);
      } catch (e) {
        console.error('Failed to remove post from MeiliSearch:', e);
      }
      if (ctx.revalidateTag) {
        ctx.revalidateTag('posts');
        ctx.revalidateTag('categories');
      }
      return post;
    }),
});
