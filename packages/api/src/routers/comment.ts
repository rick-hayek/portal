import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const commentRouter = router({
    /** Get comments for a post (top-level with nested replies) */
    byPost: publicProcedure
        .input(z.object({ postId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.comment.findMany({
                where: { postId: input.postId, parentId: null, status: 'approved' },
                orderBy: { createdAt: 'desc' },
                include: {
                    replies: {
                        where: { status: 'approved' },
                        orderBy: { createdAt: 'asc' },
                    },
                },
            });
        }),

    /** Submit a new comment — requires authentication */
    create: protectedProcedure
        .input(
            z.object({
                postId: z.string(),
                content: z.string().min(1).max(2000),
                parentId: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.comment.create({
                data: {
                    postId: input.postId,
                    authorName: ctx.user.name ?? ctx.user.email ?? 'Anonymous',
                    authorEmail: ctx.user.email,
                    content: input.content,
                    parentId: input.parentId,
                    status: 'pending',
                },
            });
        }),
});
