import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from '../trpc';

export const referenceRouter = router({
  /** List all references (metadata only, no large HTML code) */
  list: publicProcedure.query(async ({ ctx }) => {
    const fetchList = async () => {
      return ctx.prisma.reference.findMany({
        select: {
          id: true,
          slug: true,
          title: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
    };

    if (ctx.unstable_cache) {
      const getCached = ctx.unstable_cache(fetchList, ['reference-list'], {
        tags: ['references'],
        revalidate: 3600,
      });
      return getCached();
    }
    return fetchList();
  }),

  /** Get reference by ID (for admin editing) */
  getById: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return ctx.prisma.reference.findUnique({
      where: { id: input.id },
    });
  }),

  /** Create a new reference page */
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        slug: z.string().min(1).max(200),
        htmlCode: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ref = await ctx.prisma.reference.create({
        data: input,
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('references');
      }
      return ref;
    }),

  /** Update a reference page */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        slug: z.string().min(1).max(200).optional(),
        htmlCode: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const ref = await ctx.prisma.reference.update({
        where: { id },
        data,
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('references');
      }
      return ref;
    }),

  /** Delete a reference page */
  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const ref = await ctx.prisma.reference.delete({
      where: { id: input.id },
    });
    if (ctx.revalidateTag) {
      ctx.revalidateTag('references');
    }
    return ref;
  }),
});
