import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from '../trpc';
import { uploadToR2, deleteFromR2 } from '../utils/r2';

export const attachmentRouter = router({
  /** List all attachments (metadata only) */
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.attachment.findMany({
      select: {
        id: true,
        filename: true,
        mimeType: true,
        url: true,
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

      // Convert base64 string to Buffer
      const buffer = Buffer.from(input.fileData, 'base64');

      // Upload to Cloudflare R2
      const url = await uploadToR2(finalFilename, buffer, input.mimeType);

      return ctx.prisma.attachment.create({
        data: {
          filename: finalFilename,
          mimeType: input.mimeType,
          url,
        },
      });
    }),

  /** Delete an attachment */
  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const attachment = await ctx.prisma.attachment.findUnique({
      where: { id: input.id },
      select: { filename: true },
    });

    if (attachment) {
      try {
        await deleteFromR2(attachment.filename);
      } catch (err) {
        console.error('Failed to delete file from R2', err);
      }
    }

    return ctx.prisma.attachment.delete({
      where: { id: input.id },
    });
  }),
});
