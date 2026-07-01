import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from '../trpc';

export const attachmentRouter = router({
  /** List all attachments (metadata only) */
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.attachment.findMany({
      select: {
        id: true,
        filename: true,
        mimeType: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  /** Upload and create a new attachment */
  create: adminProcedure
    .input(
      z.object({
        filename: z.string().min(1).max(200),
        mimeType: z.string().min(1),
        fileData: z.string().min(1), // Base64 string
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Normalize filename: lowercase, replace spaces/specials with dashes, keep extension
      const extIndex = input.filename.lastIndexOf('.');
      const ext = extIndex !== -1 ? input.filename.slice(extIndex).toLowerCase() : '';
      let base = extIndex !== -1 ? input.filename.slice(0, extIndex) : input.filename;
      base = base
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-|-$/g, '');

      let finalFilename = `${base}${ext}`;

      // Resolve duplicate filename conflict by appending a timestamp
      const existing = await ctx.prisma.attachment.findUnique({
        where: { filename: finalFilename },
      });
      if (existing) {
        finalFilename = `${base}-${Date.now()}${ext}`;
      }

      // Convert base64 string to Buffer for Prisma Bytes type
      const buffer = Buffer.from(input.fileData, 'base64');

      return ctx.prisma.attachment.create({
        data: {
          filename: finalFilename,
          mimeType: input.mimeType,
          fileData: buffer,
        },
      });
    }),

  /** Delete an attachment */
  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.prisma.attachment.delete({
      where: { id: input.id },
    });
  }),
});
