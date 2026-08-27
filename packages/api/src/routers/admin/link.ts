import { z } from 'zod';
import { sendLinkApprovedNotification } from '../../services/email';
import { adminProcedure, router } from '../../trpc';

export const adminLinkRouter = router({
  /** List all links (admin) */
  linkList: adminProcedure.query(({ ctx }) =>
    ctx.prisma.link.findMany({
      where: { NOT: { id: 'site-self-link' } },
      orderBy: { createdAt: 'desc' },
    }),
  ),

  /** Get self link for admin */
  linkGetSelf: adminProcedure.query(({ ctx }) =>
    ctx.prisma.link.findUnique({
      where: { id: 'site-self-link' },
    }),
  ),

  /** Save self link (upsert) */
  linkSaveSelf: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        url: z.string().url(),
        rss: z.string().optional().or(z.literal('')),
        avatar: z.string().optional().or(z.literal('')),
        screenshot: z.string().optional().or(z.literal('')),
        description: z.string().optional().or(z.literal('')),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.prisma.link.upsert({
        where: { id: 'site-self-link' },
        create: {
          id: 'site-self-link',
          name: input.name,
          url: input.url,
          rss: input.rss || null,
          avatar: input.avatar || null,
          screenshot: input.screenshot || null,
          description: input.description || null,
          category: 'site-self',
          status: 'approved',
          isAlive: true,
        },
        update: {
          name: input.name,
          url: input.url,
          rss: input.rss === '' ? null : input.rss,
          avatar: input.avatar === '' ? null : input.avatar,
          screenshot: input.screenshot === '' ? null : input.screenshot,
          description: input.description === '' ? null : input.description,
        },
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('links');
      }
      return link;
    }),

  /** Create link */
  linkCreate: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        url: z.string().url(),
        rss: z.string().optional().or(z.literal('')),
        avatar: z.string().url().optional().or(z.literal('')),
        screenshot: z.string().url().optional().or(z.literal('')),
        description: z.string().optional().or(z.literal('')),
        category: z.string().default('default'),
        status: z.string().default('approved'),
        isAlive: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.prisma.link.create({
        data: {
          ...input,
          rss: input.rss || null,
          avatar: input.avatar || null,
          screenshot: input.screenshot || null,
          description: input.description || null,
        },
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('links');
      }
      return link;
    }),

  /** Update link */
  linkUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(200).optional(),
        url: z.string().url().optional(),
        rss: z.string().nullable().optional().or(z.literal('')),
        avatar: z.string().url().nullable().optional().or(z.literal('')),
        screenshot: z.string().url().nullable().optional().or(z.literal('')),
        description: z.string().nullable().optional().or(z.literal('')),
        category: z.string().optional(),
        status: z.string().optional(),
        isAlive: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.prisma.link.findUnique({
        where: { id },
      });

      const link = await ctx.prisma.link.update({
        where: { id },
        data: {
          ...data,
          rss: data.rss === '' ? null : data.rss,
          avatar: data.avatar === '' ? null : data.avatar,
          screenshot: data.screenshot === '' ? null : data.screenshot,
          description: data.description === '' ? null : data.description,
        },
      });

      if (
        existing &&
        existing.status !== 'approved' &&
        link.status === 'approved' &&
        link.email
      ) {
        const siteTitle = ctx.siteConfig?.site.title || 'Voocii';
        const siteUrl = (ctx.siteConfig?.site.url || 'https://voocii.com').replace(/\/+$/, '');
        const locale = link.locale || ctx.siteConfig?.site.locale || 'zh';
        const enabled = ctx.siteConfig?.email?.enabled ?? false;
        const provider = ctx.siteConfig?.email?.enabled ? ctx.siteConfig.email.provider : undefined;

        sendLinkApprovedNotification({
          applicantEmail: link.email,
          applicantName: link.name,
          applicantUrl: link.url,
          siteTitle,
          siteUrl,
          locale,
          enabled,
          provider,
        }).catch((err) => console.error('[linkUpdate] Failed to trigger email notification:', err));
      }

      if (ctx.revalidateTag) {
        ctx.revalidateTag('links');
      }
      return link;
    }),

  /** Delete link */
  linkDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.prisma.link.delete({ where: { id: input.id } });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('links');
      }
      return link;
    }),
});
