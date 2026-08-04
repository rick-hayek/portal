import { defaultAboutConfig } from '@portal/config';
import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from '../trpc';

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
}

export interface SocialLinkItem {
  label: string;
  href: string;
  icon?: string;
  displayMode?: 'icon' | 'text' | 'both';
}

export interface EmailConfig {
  address: string;
  icon?: string;
  displayMode?: 'icon' | 'text' | 'both';
}

export interface AuthorConfig {
  name?: string;
  role?: string;
  role_en?: string;
  stack?: string | string[];
  status?: string;
}

export const aboutRouter = router({
  getAbout: publicProcedure.query(async ({ ctx }) => {
    const fetchData = async () => {
      const record = await ctx.prisma.aboutInfo.findUnique({
        where: { id: 'default' },
      });

      if (!record) {
        return {
          ...defaultAboutConfig,
          title_en: null,
          subtitle_en: null,
          description_en: null,
          author: null,
        };
      }

      return {
        title: record.title || defaultAboutConfig.title,
        title_en: record.title_en || null,
        subtitle: record.subtitle || defaultAboutConfig.subtitle,
        subtitle_en: record.subtitle_en || null,
        description: record.description || defaultAboutConfig.description,
        description_en: record.description_en || null,
        experiences: Array.isArray(record.experiences)
          ? (record.experiences as unknown as ExperienceItem[])
          : defaultAboutConfig.experiences,
        socialLinks: Array.isArray(record.socialLinks)
          ? (record.socialLinks as unknown as SocialLinkItem[])
          : defaultAboutConfig.socialLinks,
        email: (record.email as unknown as EmailConfig) || defaultAboutConfig.email,
        author: (record.author as unknown as AuthorConfig) || null,
      };
    };

    if (ctx.unstable_cache) {
      const getCached = ctx.unstable_cache(fetchData, ['about-info'], {
        tags: ['about'],
        revalidate: 3600,
      });
      return (await getCached()) as Awaited<ReturnType<typeof fetchData>>;
    }
    return fetchData();
  }),

  updateAbout: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        title_en: z.string().optional().nullable(),
        subtitle: z.string().default('ABOUT ME'),
        subtitle_en: z.string().optional().nullable(),
        description: z.string().min(1, 'Description is required'),
        description_en: z.string().optional().nullable(),
        experiences: z.array(
          z.object({
            role: z.string(),
            company: z.string(),
            period: z.string(),
          }),
        ),
        socialLinks: z.array(
          z.object({
            label: z.string(),
            href: z.string(),
            icon: z.string().optional(),
            displayMode: z.enum(['icon', 'text', 'both']).optional(),
          }),
        ),
        email: z
          .object({
            address: z.string(),
            icon: z.string().optional(),
            displayMode: z.enum(['icon', 'text', 'both']).optional(),
          })
          .optional()
          .nullable(),
        author: z
          .object({
            name: z.string().optional(),
            role: z.string().optional(),
            role_en: z.string().optional(),
            stack: z.union([z.string(), z.array(z.string())]).optional(),
            status: z.string().optional(),
            title1: z.string().optional(),
            title1_en: z.string().optional(),
            title2: z.string().optional(),
            title2_en: z.string().optional(),
            description: z.string().optional(),
            description_en: z.string().optional(),
          })
          .optional()
          .nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.prisma.aboutInfo.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          title: input.title,
          title_en: input.title_en ?? undefined,
          subtitle: input.subtitle,
          subtitle_en: input.subtitle_en ?? undefined,
          description: input.description,
          description_en: input.description_en ?? undefined,
          experiences: input.experiences as any,
          socialLinks: input.socialLinks as any,
          email: (input.email as any) ?? undefined,
          author: (input.author as any) ?? undefined,
        },
        update: {
          title: input.title,
          title_en: input.title_en ?? undefined,
          subtitle: input.subtitle,
          subtitle_en: input.subtitle_en ?? undefined,
          description: input.description,
          description_en: input.description_en ?? undefined,
          experiences: input.experiences as any,
          socialLinks: input.socialLinks as any,
          email: (input.email as any) ?? undefined,
          author: (input.author as any) ?? undefined,
        },
      });

      if (ctx.revalidateTag) {
        ctx.revalidateTag('about');
      }

      return updated;
    }),
});
