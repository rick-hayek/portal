import { z } from 'zod';
import { adminProcedure, router } from '../../trpc';

export const adminProjectRouter = router({
  /** List all projects (admin) */
  projectList: adminProcedure.query(({ ctx }) =>
    ctx.prisma.project.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    }),
  ),

  /** Get project by ID */
  projectGet: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => ctx.prisma.project.findUnique({ where: { id: input.id } })),

  /** Create project */
  projectCreate: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        slug: z.string().min(1).max(200),
        description: z.string().min(1),
        descriptionEn: z.string().optional(),
        coverImage: z.string().optional(),
        liveUrl: z.string().optional(),
        repoUrl: z.string().optional(),
        techStack: z.array(z.string()).default([]),
        sortOrder: z.number().int().default(0),
        featured: z.boolean().default(false),
        privacyPolicy: z.string().optional(),
        privacyPolicyEn: z.string().optional(),
        termsOfService: z.string().optional(),
        termsOfServiceEn: z.string().optional(),
        logo: z.string().optional(),
        downloadLinks: z.any().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.create({ data: input });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('projects');
      }
      return project;
    }),

  /** Update project */
  projectUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        slug: z.string().min(1).max(200).optional(),
        description: z.string().min(1).optional(),
        descriptionEn: z.string().nullable().optional(),
        coverImage: z.string().nullable().optional(),
        liveUrl: z.string().nullable().optional(),
        repoUrl: z.string().nullable().optional(),
        techStack: z.array(z.string()).optional(),
        sortOrder: z.number().int().optional(),
        featured: z.boolean().optional(),
        privacyPolicy: z.string().nullable().optional(),
        privacyPolicyEn: z.string().nullable().optional(),
        termsOfService: z.string().nullable().optional(),
        termsOfServiceEn: z.string().nullable().optional(),
        logo: z.string().nullable().optional(),
        downloadLinks: z.any().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const project = await ctx.prisma.project.update({ where: { id }, data });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('projects');
      }
      return project;
    }),

  /** Delete project */
  projectDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.delete({ where: { id: input.id } });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('projects');
      }
      return project;
    }),
});
