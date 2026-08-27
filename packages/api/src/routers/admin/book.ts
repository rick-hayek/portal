import { z } from 'zod';
import { adminProcedure, router } from '../../trpc';

export const adminBookRouter = router({
  /** List all books (admin) */
  bookList: adminProcedure.query(({ ctx }) =>
    ctx.prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ),

  /** Get book by ID */
  bookGet: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => ctx.prisma.book.findUnique({ where: { id: input.id } })),

  /** Create book */
  bookCreate: adminProcedure
    .input(
      z.object({
        slug: z
          .string()
          .min(1)
          .regex(/^[a-z0-9_-]+$/, 'Slug must be lowercase alphanumeric, dashes, or underscores'),
        title: z.string().min(1),
        coverImageURL: z.string().nullable().optional().or(z.literal('')),
        author: z.string().min(1),
        publisher: z.string().nullable().optional().or(z.literal('')),
        translator: z.string().nullable().optional().or(z.literal('')),
        isbn: z.string().nullable().optional().or(z.literal('')),
        publishYear: z.string().nullable().optional().or(z.literal('')),
        ebookUrl: z.string().url().nullable().optional().or(z.literal('')),
        originalBookId: z.string().nullable().optional().or(z.literal('')),
        description: z.string().nullable().optional().or(z.literal('')),
        review: z.string().nullable().optional().or(z.literal('')),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const book = await ctx.prisma.book.create({
        data: {
          slug: input.slug.toLowerCase().trim(),
          title: input.title,
          coverImageURL: input.coverImageURL || null,
          author: input.author,
          publisher: input.publisher || null,
          translator: input.translator || null,
          isbn: input.isbn || null,
          publishYear: input.publishYear || null,
          ebookUrl: input.ebookUrl || null,
          originalBookId: input.originalBookId || null,
          description: input.description || null,
          review: input.review || null,
        },
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('books');
      }
      return book;
    }),

  /** Update book */
  bookUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        slug: z
          .string()
          .min(1)
          .regex(/^[a-z0-9_-]+$/, 'Slug must be lowercase alphanumeric, dashes, or underscores')
          .optional(),
        title: z.string().min(1).optional(),
        coverImageURL: z.string().nullable().optional().or(z.literal('')),
        author: z.string().min(1).optional(),
        publisher: z.string().nullable().optional().or(z.literal('')),
        translator: z.string().nullable().optional().or(z.literal('')),
        isbn: z.string().nullable().optional().or(z.literal('')),
        publishYear: z.string().nullable().optional().or(z.literal('')),
        ebookUrl: z.string().url().nullable().optional().or(z.literal('')),
        originalBookId: z.string().nullable().optional().or(z.literal('')),
        description: z.string().nullable().optional().or(z.literal('')),
        review: z.string().nullable().optional().or(z.literal('')),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const book = await ctx.prisma.book.update({
        where: { id },
        data: {
          ...data,
          slug: data.slug ? data.slug.toLowerCase().trim() : undefined,
          coverImageURL: data.coverImageURL || null,
          publisher: data.publisher || null,
          translator: data.translator || null,
          isbn: data.isbn || null,
          publishYear: data.publishYear || null,
          ebookUrl: data.ebookUrl !== undefined ? data.ebookUrl || null : undefined,
          originalBookId: data.originalBookId || null,
          description: data.description || null,
          review: data.review || null,
        },
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('books');
      }
      return book;
    }),

  /** Delete book */
  bookDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const book = await ctx.prisma.book.delete({ where: { id: input.id } });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('books');
      }
      return book;
    }),
});
