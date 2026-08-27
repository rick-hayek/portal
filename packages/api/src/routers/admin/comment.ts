import { getCommentAnchor } from '@portal/shared';
import { z } from 'zod';
import {
  dispatchCommentNotifications,
  sendCommentApprovedNotification,
} from '../../services/email';
import { adminProcedure, router } from '../../trpc';

export const adminCommentRouter = router({
  /** Update comment status */
  commentModerate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['approved', 'spam', 'pending']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.comment.findUnique({
        where: { id: input.id },
        include: { post: { select: { title: true, slug: true } } },
      });

      const comment = await ctx.prisma.comment.update({
        where: { id: input.id },
        data: { status: input.status },
        include: { post: { select: { title: true, slug: true } } },
      });

      if (
        existing &&
        existing.status !== 'approved' &&
        input.status === 'approved'
      ) {
        if (comment.authorEmail) {
          const siteTitle = ctx.siteConfig?.site.title || 'Voocii';
          const siteUrl = (ctx.siteConfig?.site.url || 'https://voocii.com').replace(/\/+$/, '');
          const locale = comment.locale || ctx.siteConfig?.site.locale || 'zh';
          const enabled = ctx.siteConfig?.email?.enabled ?? false;
          const provider = ctx.siteConfig?.email?.enabled ? ctx.siteConfig.email.provider : undefined;

          sendCommentApprovedNotification({
            authorEmail: comment.authorEmail,
            authorName: comment.authorName,
            postTitle: comment.post?.title || 'Article',
            postUrl: `${siteUrl}/blog/${comment.post?.slug || ''}#${getCommentAnchor(comment.id)}`,
            commentContent: comment.content,
            siteTitle,
            siteUrl,
            locale,
            enabled,
            provider,
          }).catch((err) => console.error('[commentModerate] Failed to trigger email notification:', err));
        }

        dispatchCommentNotifications({
          prisma: ctx.prisma,
          comment,
          siteConfig: ctx.siteConfig,
        }).catch((err) => console.error('[commentModerate] Failed to dispatch notifications:', err));
      }

      if (ctx.revalidateTag) {
        ctx.revalidateTag('posts');
      }
      return comment;
    }),

  /** Delete comment */
  commentDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.delete({ where: { id: input.id } });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('posts');
      }
      return comment;
    }),
});
