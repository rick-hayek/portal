import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminProcedure, router } from '../../trpc';

export const adminCategoryRouter = router({
  /** Create category */
  categoryCreate: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        name_en: z.string().max(50).optional().nullable(),
        slug: z.string().min(1).max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if a category with the same name or slug already exists
      const duplicate = await ctx.prisma.category.findFirst({
        where: {
          OR: [{ name: input.name }, { slug: input.slug }],
        },
      });
      if (duplicate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Category with this name or slug already exists',
        });
      }

      const category = await ctx.prisma.category.create({
        data: input,
      });

      if (ctx.revalidateTag) {
        ctx.revalidateTag('categories');
      }

      return category;
    }),

  /** Update category */
  categoryUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50).optional(),
        name_en: z.string().max(50).optional().nullable(),
        slug: z.string().min(1).max(50).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check if the updated name or slug conflicts with another category
      if (data.name || data.slug) {
        const duplicate = await ctx.prisma.category.findFirst({
          where: {
            id: { not: id },
            OR: [
              ...(data.name ? [{ name: data.name }] : []),
              ...(data.slug ? [{ slug: data.slug }] : []),
            ],
          },
        });
        if (duplicate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Another category with this name or slug already exists',
          });
        }
      }

      const category = await ctx.prisma.category.update({
        where: { id },
        data,
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('categories');
        ctx.revalidateTag('posts');
      }
      return category;
    }),

  /** Delete category */
  categoryDelete: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.prisma.category.delete({
        where: { id: input.id },
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('categories');
        ctx.revalidateTag('posts');
      }
      return category;
    }),
});
