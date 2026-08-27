import { z } from 'zod';
import { adminProcedure, router } from '../../trpc';

export const adminConfigRouter = router({
  /** Get a site config value */
  configGet: adminProcedure
    .input(z.object({ key: z.string() }))
    .query(({ ctx, input }) => ctx.prisma.siteConfig.findUnique({ where: { key: input.key } })),

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
