import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { attachCommentAvatars } from '../utils/gravatar';

export const commentRouter = router({
  /** Get comments for a post (top-level with nested replies) */
  byPost: publicProcedure.input(z.object({ postId: z.string() })).query(async ({ ctx, input }) => {
    const comments = await ctx.prisma.comment.findMany({
      where: { postId: input.postId, parentId: null, status: 'approved' },
      orderBy: { createdAt: 'desc' },
      include: {
        replies: {
          where: { status: 'approved' },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return attachCommentAvatars(ctx.prisma, comments);
  }),

  /** Submit a new comment — open to both guests and authenticated users */
  create: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().trim().min(1, 'Content is required').max(2000, 'Content too long'),
        parentId: z.string().optional(),
        authorName: z.string().trim().max(50, 'Name too long').optional(),
        authorEmail: z.string().trim().optional(),
        authorUrl: z.string().trim().optional(),
        locale: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let finalName = input.authorName?.trim() || '';
      let finalEmail = input.authorEmail?.trim() || '';
      let finalUrl = input.authorUrl?.trim() || null;

      const currentUser = ctx.session?.user;

      // If user is authenticated, fill defaults if empty
      if (currentUser) {
        if (!finalName) {
          finalName = currentUser.name || currentUser.email || 'Anonymous';
        }
        if (!finalEmail && currentUser.email) {
          finalEmail = currentUser.email;
        }
      }

      // Validation: Name is required
      if (!finalName) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Author name is required',
        });
      }

      // Validation: Email is required and must be valid
      if (!finalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'A valid author email is required',
        });
      }

      // Validation: URL (if provided) must start with https://
      if (finalUrl) {
        if (!/^https:\/\//i.test(finalUrl)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Website URL must start with https://',
          });
        }
      }

      const status = currentUser ? 'approved' : 'pending';

      const comment = await ctx.prisma.comment.create({
        data: {
          postId: input.postId,
          authorName: finalName,
          authorEmail: finalEmail,
          authorUrl: finalUrl,
          content: input.content,
          parentId: input.parentId || null,
          locale: input.locale || 'zh',
          status,
        },
      });

      if (status === 'approved' && ctx.revalidateTag) {
        ctx.revalidateTag('posts');
      }

      return comment;
    }),
});
