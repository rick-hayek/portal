import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const bookRouter = router({
  /** List all books */
  list: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }),

  /** Get a single book by SLUG with likes counts & user reaction state */
  get: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const book = await ctx.prisma.book.findUnique({
      where: { slug: input.slug },
      include: {
        likes: true,
        originalBook: {
          select: {
            id: true,
            slug: true,
            title: true,
            author: true,
          },
        },
      },
    });
    if (!book) return null;

    const likesCount = book.likes.filter((l) => l.type === 'LIKE').length;
    const dislikesCount = book.likes.filter((l) => l.type === 'DISLIKE').length;

    const currentUserId = ctx.session?.user?.id;
    const userReaction = currentUserId
      ? (book.likes.find((l) => l.userId === currentUserId)?.type ?? null)
      : null;

    // Exclude likes array to prevent sending user list to frontend
    const { likes, ...bookData } = book;

    return {
      ...bookData,
      likesCount,
      dislikesCount,
      userReaction,
    };
  }),

  /** Toggle or set a reaction on a book (requires authentication) */
  react: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
        type: z.enum(['LIKE', 'DISLIKE', 'NONE']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      if (input.type === 'NONE') {
        try {
          await ctx.prisma.bookLike.delete({
            where: {
              bookId_userId: {
                bookId: input.bookId,
                userId,
              },
            },
          });
        } catch {
          // Ignore if reaction was not found
        }
      } else {
        await ctx.prisma.bookLike.upsert({
          where: {
            bookId_userId: {
              bookId: input.bookId,
              userId,
            },
          },
          update: {
            type: input.type,
          },
          create: {
            bookId: input.bookId,
            userId,
            type: input.type,
          },
        });
      }

      return { success: true };
    }),
});
