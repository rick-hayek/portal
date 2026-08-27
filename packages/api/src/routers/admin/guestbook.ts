import { z } from 'zod';
import { adminProcedure, router } from '../../trpc';

export const adminGuestbookRouter = router({
  /** Delete guestbook entry */
  guestbookDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.prisma.guestbookEntry.delete({ where: { id: input.id } });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('guestbook');
      }
      return entry;
    }),
});
