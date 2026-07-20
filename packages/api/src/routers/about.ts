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

export const aboutRouter = router({
  getAbout: publicProcedure.query(async ({ ctx }) => {
    const fetchData = async () => {
      const record = await ctx.prisma.aboutInfo.findUnique({
        where: { id: 'default' },
      });

      if (!record) {
        return defaultAboutConfig;
      }

      return {
        title: record.title || defaultAboutConfig.title,
        subtitle: record.subtitle || defaultAboutConfig.subtitle,
        description: record.description || defaultAboutConfig.description,
        experiences: Array.isArray(record.experiences)
          ? (record.experiences as unknown as ExperienceItem[])
          : defaultAboutConfig.experiences,
        socialLinks: Array.isArray(record.socialLinks)
          ? (record.socialLinks as unknown as SocialLinkItem[])
          : defaultAboutConfig.socialLinks,
        email: (record.email as unknown as EmailConfig) || defaultAboutConfig.email,
      };
    };

    if (ctx.unstable_cache) {
      const getCached = ctx.unstable_cache(
        fetchData,
        ['about-info'],
        { tags: ['about'], revalidate: 3600 },
      );
      return (await getCached()) as Awaited<ReturnType<typeof fetchData>>;
    }
    return fetchData();
  }),

  updateAbout: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        subtitle: z.string().default('ABOUT ME'),
        description: z.string().min(1, 'Description is required'),
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.prisma.aboutInfo.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          title: input.title,
          subtitle: input.subtitle,
          description: input.description,
          experiences: input.experiences as any,
          socialLinks: input.socialLinks as any,
          email: (input.email as any) ?? undefined,
        },
        update: {
          title: input.title,
          subtitle: input.subtitle,
          description: input.description,
          experiences: input.experiences as any,
          socialLinks: input.socialLinks as any,
          email: (input.email as any) ?? undefined,
        },
      });

      if (ctx.revalidateTag) {
        ctx.revalidateTag('about');
      }

      return updated;
    }),
});
