import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { ensurePostsIndex, indexPost, meili, POSTS_INDEX, removePostFromIndex } from '../search';
import { adminProcedure, protectedProcedure, router } from '../trpc';

export const adminRouter = router({
  /** Dashboard stats */
  stats: adminProcedure.query(async ({ ctx }) => {
    const [totalPosts, publishedPosts, totalComments, pendingComments, totalGuestbook, totalViews] =
      await Promise.all([
        ctx.prisma.post.count(),
        ctx.prisma.post.count({ where: { status: 'published' } }),
        ctx.prisma.comment.count(),
        ctx.prisma.comment.count({ where: { status: 'pending' } }),
        ctx.prisma.guestbookEntry.count(),
        ctx.prisma.pageView.count(),
      ]);
    return {
      totalPosts,
      publishedPosts,
      totalComments,
      pendingComments,
      totalGuestbook,
      totalViews,
    };
  }),

  /** Recent comments (for dashboard) */
  recentComments: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(5) }).optional())
    .query(({ ctx, input }) =>
      ctx.prisma.comment.findMany({
        take: input?.limit ?? 5,
        orderBy: { createdAt: 'desc' },
        include: { post: { select: { title: true, slug: true } } },
      }),
    ),

  /** Recent guestbook (for dashboard) */
  recentGuestbook: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(5) }).optional())
    .query(({ ctx, input }) =>
      ctx.prisma.guestbookEntry.findMany({
        take: input?.limit ?? 5,
        orderBy: { createdAt: 'desc' },
      }),
    ),

  // ── Post CRUD ──────────────────────────────────────

  /** List all posts (admin view — includes drafts) */
  postList: adminProcedure
    .input(
      z
        .object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(20),
          status: z.enum(['all', 'draft', 'published']).default('all'),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input: rawInput }) => {
      const input = rawInput ?? { page: 1, limit: 20, status: 'all' as const };
      const where: Record<string, unknown> = {};
      if (input.status !== 'all') where.status = input.status;
      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: 'insensitive' } },
          { content: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      const [items, total] = await Promise.all([
        ctx.prisma.post.findMany({
          where,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: { updatedAt: 'desc' },
          include: {
            category: { select: { name: true } },
            _count: { select: { comments: true } },
          },
        }),
        ctx.prisma.post.count({ where }),
      ]);

      return { items, total, page: input.page, totalPages: Math.ceil(total / input.limit) };
    }),

  /** Create post */
  postCreate: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        slug: z.string().min(1).max(200),
        content: z.string().min(1),
        excerpt: z.string().max(500).optional(),
        status: z.enum(['draft', 'published']).default('draft'),
        categoryId: z.string().optional(),
        tagIds: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.create({
        data: {
          title: input.title,
          slug: input.slug,
          content: input.content,
          excerpt: input.excerpt,
          status: input.status,
          authorId: ctx.user.id,
          categoryId: input.categoryId,
          publishedAt: input.status === 'published' ? new Date() : null,
          tags: {
            create: input.tagIds.map((tagId) => ({ tagId })),
          },
        },
        include: { category: true },
      });

      if (post.status === 'published') {
        try {
          await ensurePostsIndex();
          await indexPost(post);
        } catch (e) {
          console.error('Failed to index post in MeiliSearch:', e);
        }
      }

      if (ctx.revalidateTag) {
        ctx.revalidateTag('posts');
        ctx.revalidateTag('categories');
      }

      return post;
    }),

  /** Get post by ID */
  postGet: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const post = await ctx.prisma.post.findUnique({
      where: { id: input.id },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
    return post;
  }),

  /** Update post */
  postUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        slug: z.string().min(1).max(200).optional(),
        content: z.string().min(1).optional(),
        excerpt: z.string().max(500).optional(),
        status: z.enum(['draft', 'published']).optional(),
        categoryId: z.string().nullable().optional(),
        tagIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, tagIds, ...data } = input;

      // Handle publish date
      if (data.status === 'published') {
        const existing = await ctx.prisma.post.findUnique({ where: { id } });
        if (existing && !existing.publishedAt) {
          (data as Record<string, unknown>).publishedAt = new Date();
        }
      }

      // Update tags if provided
      if (tagIds !== undefined) {
        await ctx.prisma.postTag.deleteMany({ where: { postId: id } });
        await ctx.prisma.postTag.createMany({
          data: tagIds.map((tagId) => ({ postId: id, tagId })),
        });
      }

      const updatedPost = await ctx.prisma.post.update({
        where: { id },
        data,
        include: { category: true },
      });

      // Sync to MeiliSearch
      try {
        await ensurePostsIndex();
        if (updatedPost.status === 'published') {
          await indexPost(updatedPost);
        } else {
          await removePostFromIndex(updatedPost.id);
        }
      } catch (e) {
        console.error('Failed to sync post in MeiliSearch:', e);
      }

      if (ctx.revalidateTag) {
        ctx.revalidateTag('posts');
        ctx.revalidateTag('categories');
      }

      return updatedPost;
    }),

  /** Delete post */
  postDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.delete({ where: { id: input.id } });
      try {
        await removePostFromIndex(input.id);
      } catch (e) {
        console.error('Failed to remove post from MeiliSearch:', e);
      }
      if (ctx.revalidateTag) {
        ctx.revalidateTag('posts');
        ctx.revalidateTag('categories');
      }
      return post;
    }),

  // ── Comment Moderation ─────────────────────────────

  /** Update comment status */
  commentModerate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['approved', 'spam', 'pending']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.update({
        where: { id: input.id },
        data: { status: input.status },
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('posts');
      }
      return comment;
    }),

  /** Delete comment */
  commentDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.delete({ where: { id: input.id } });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('posts');
      }
      return comment;
    }),

  // ── Guestbook Moderation ───────────────────────────

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

  // ── Portfolio CRUD ─────────────────────────────────

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

  // ── Books CRUD ─────────────────────────────────

  /** List all books (admin) */
  bookList: adminProcedure.query(({ ctx }) =>
    ctx.prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ),

  /** Get book by ID */
  bookGet: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => ctx.prisma.book.findUnique({ where: { id: input.id } })),

  /** Create book */
  bookCreate: adminProcedure
    .input(
      z.object({
        slug: z
          .string()
          .min(1)
          .regex(/^[a-z0-9_-]+$/, 'Slug must be lowercase alphanumeric, dashes, or underscores'),
        title: z.string().min(1),
        coverImageURL: z.string().url().nullable().optional().or(z.literal('')),
        coverImage: z.string().nullable().optional().or(z.literal('')),
        author: z.string().min(1),
        publisher: z.string().nullable().optional().or(z.literal('')),
        translator: z.string().nullable().optional().or(z.literal('')),
        isbn: z.string().nullable().optional().or(z.literal('')),
        publishYear: z.string().nullable().optional().or(z.literal('')),
        originalBookId: z.string().nullable().optional().or(z.literal('')),
        description: z.string().nullable().optional().or(z.literal('')),
        review: z.string().nullable().optional().or(z.literal('')),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const book = await ctx.prisma.book.create({
        data: {
          slug: input.slug.toLowerCase().trim(),
          title: input.title,
          coverImageURL: input.coverImageURL || null,
          coverImage: input.coverImage || null,
          author: input.author,
          publisher: input.publisher || null,
          translator: input.translator || null,
          isbn: input.isbn || null,
          publishYear: input.publishYear || null,
          originalBookId: input.originalBookId || null,
          description: input.description || null,
          review: input.review || null,
        },
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('books');
      }
      return book;
    }),

  /** Update book */
  bookUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        slug: z
          .string()
          .min(1)
          .regex(/^[a-z0-9_-]+$/, 'Slug must be lowercase alphanumeric, dashes, or underscores')
          .optional(),
        title: z.string().min(1).optional(),
        coverImageURL: z.string().url().nullable().optional().or(z.literal('')),
        coverImage: z.string().nullable().optional().or(z.literal('')),
        author: z.string().min(1).optional(),
        publisher: z.string().nullable().optional().or(z.literal('')),
        translator: z.string().nullable().optional().or(z.literal('')),
        isbn: z.string().nullable().optional().or(z.literal('')),
        publishYear: z.string().nullable().optional().or(z.literal('')),
        originalBookId: z.string().nullable().optional().or(z.literal('')),
        description: z.string().nullable().optional().or(z.literal('')),
        review: z.string().nullable().optional().or(z.literal('')),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const book = await ctx.prisma.book.update({
        where: { id },
        data: {
          ...data,
          slug: data.slug ? data.slug.toLowerCase().trim() : undefined,
          coverImageURL: data.coverImageURL || null,
          coverImage: data.coverImage || null,
          publisher: data.publisher || null,
          translator: data.translator || null,
          isbn: data.isbn || null,
          publishYear: data.publishYear || null,
          originalBookId: data.originalBookId || null,
          description: data.description || null,
          review: data.review || null,
        },
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('books');
      }
      return book;
    }),

  /** Delete book */
  bookDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const book = await ctx.prisma.book.delete({ where: { id: input.id } });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('books');
      }
      return book;
    }),

  // ── Links CRUD ─────────────────────────────────

  /** List all links (admin) */
  linkList: adminProcedure.query(({ ctx }) =>
    ctx.prisma.link.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    }),
  ),

  /** Create link */
  linkCreate: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        url: z.string().url(),
        avatar: z.string().url().optional().or(z.literal('')),
        description: z.string().optional().or(z.literal('')),
        category: z.string().default('default'),
        isAlive: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.prisma.link.create({
        data: {
          ...input,
          avatar: input.avatar || null,
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
        avatar: z.string().url().nullable().optional().or(z.literal('')),
        description: z.string().nullable().optional().or(z.literal('')),
        category: z.string().optional(),
        isAlive: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const link = await ctx.prisma.link.update({
        where: { id },
        data: {
          ...data,
          avatar: data.avatar === '' ? null : data.avatar,
          description: data.description === '' ? null : data.description,
        },
      });
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

  // ── Site Settings ──────────────────────────────────

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

  /** Create category */
  categoryCreate: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
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

  /** Sync all posts to MeiliSearch index */
  searchSync: adminProcedure.mutation(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      where: { status: 'published' },
      include: { category: true },
    });
    try {
      await ensurePostsIndex();
      await meili.index(POSTS_INDEX).deleteAllDocuments();
      if (posts.length > 0) {
        await meili.index(POSTS_INDEX).addDocuments(
          posts.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt ?? '',
            content: post.content,
            status: post.status,
            categoryName: post.category?.name ?? '',
            categorySlug: post.category?.slug ?? '',
            publishedAt: post.publishedAt?.toISOString() ?? null,
          })),
        );
      }
      return { success: true, count: posts.length };
    } catch (e: any) {
      throw new Error(`MeiliSearch sync failed: ${e?.message ?? e}`);
    }
  }),

  // ============ AI Trending ============

  /** Fetch trending AI/LLM repos from GitHub for the current week */
  trendingFetch: adminProcedure.mutation(async ({ ctx }) => {
    try {
      // Calculate the Monday of this week
      const now = new Date();
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1; // Monday = 0 offset
      const monday = new Date(now);
      monday.setDate(now.getDate() - diff);
      monday.setHours(0, 0, 0, 0);

      // Monday of last week to compute star growth delta
      const lastMonday = new Date(monday);
      lastMonday.setDate(monday.getDate() - 7);
      lastMonday.setHours(0, 0, 0, 0);

      // 180 days ago for the search query (to capture recently created trending projects)
      const halfYearAgo = new Date(now);
      halfYearAgo.setDate(now.getDate() - 180);
      const dateStr = halfYearAgo.toISOString().split('T')[0];

      // Build GitHub Search API request with advanced OR query terms split to respect OR limitations
      const searchTerms1 = [
        'ai',
        'llm',
        '"large language model"',
        '"generative ai"',
        '"generative-ai"',
      ].join(' OR ');

      const searchTerms2 = [
        '"ai agent"',
        '"ai-agent"',
        '"agentic ai"',
        '"agentic-ai"',
      ].join(' OR ');

      const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Portal-Trending-Bot',
      };
      const token = process.env.GITHUB_TOKEN;
      if (token && !token.startsWith('your_')) {
        headers.Authorization = `Bearer ${token}`;
      }

      interface GithubRepo {
        id: number;
        name: string;
        full_name: string;
        html_url: string;
        description: string | null;
        language: string | null;
        stargazers_count: number;
        forks_count: number;
        created_at: string;
        topics: string[];
      }

      const fetchRepos = async (searchTerms: string): Promise<GithubRepo[]> => {
        const query = `${searchTerms} created:>${dateStr}`;
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100`;
        console.log(`[GitHub API] Fetching from: ${url}`);
        const res = await fetch(url, { headers });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`GitHub API error ${res.status}: ${text}`);
        }
        const data = (await res.json()) as { items: GithubRepo[] };
        return data.items ?? [];
      };

      const [repos1, repos2] = await Promise.all([
        fetchRepos(searchTerms1),
        fetchRepos(searchTerms2),
      ]);

      // Merge and deduplicate by GitHub ID
      const mergedMap = new Map<number, GithubRepo>();
      for (const r of [...repos1, ...repos2]) {
        mergedMap.set(r.id, r);
      }

      // Sort by stargazers_count desc and take top 100
      const finalItems = Array.from(mergedMap.values())
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 100);

      console.log(`[GitHub API] Successfully retrieved and merged ${finalItems.length} candidate repositories.`);

      let upsertCount = 0;
      for (const repo of finalItems) {
        // Find last week's star count to calculate starsGrowth
        const lastWeekRecord = await ctx.prisma.trendingRepo.findUnique({
          where: {
            githubId_weekOf: {
              githubId: repo.id,
              weekOf: lastMonday,
            },
          },
          select: { stars: true },
        });

        let growth = 0;
        if (lastWeekRecord) {
          growth = repo.stargazers_count - lastWeekRecord.stars;
        } else {
          // Fallback: estimate growth based on total stars divided by age in days times 7
          const createdDate = new Date(repo.created_at);
          const daysOld = Math.max(1, Math.round((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
          growth = Math.round((repo.stargazers_count / daysOld) * 7);
        }

        growth = Math.max(0, growth);

        await ctx.prisma.trendingRepo.upsert({
          where: {
            githubId_weekOf: {
              githubId: repo.id,
              weekOf: monday,
            },
          },
          update: {
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            starsGrowth: growth,
            description: repo.description,
            topics: repo.topics ?? [],
          },
          create: {
            githubId: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            url: repo.html_url,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            starsGrowth: growth,
            repoCreatedAt: new Date(repo.created_at),
            topics: repo.topics ?? [],
            weekOf: monday,
          },
        });
        upsertCount++;
      }

      if (ctx.revalidateTag) {
        ctx.revalidateTag('trending');
      }
      return { success: true, count: upsertCount, weekOf: monday.toISOString() };
    } catch (error: any) {
      console.error('[adminRouter.trendingFetch] Error fetching/saving trending repos:', error);
      throw error;
    }
  }),

  /** Update trending repo summaries */
  trendingUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        summaryZh: z.string().optional(),
        summaryEn: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const repo = await ctx.prisma.trendingRepo.update({
        where: { id: input.id },
        data: {
          summaryZh: input.summaryZh,
          summaryEn: input.summaryEn,
        },
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('trending');
      }
      return repo;
    }),

  /** List all trending repos for admin management (with pagination) */
  trendingList: adminProcedure
    .input(
      z
        .object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(100).default(20),
          weekOf: z.string().optional(),
        })
        .default({ page: 1, limit: 20 }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      let targetWeek: Date | undefined;
      if (input.weekOf) {
        targetWeek = new Date(input.weekOf);
      } else {
        const latest = await ctx.prisma.trendingRepo.findFirst({
          orderBy: { weekOf: 'desc' },
          select: { weekOf: true },
        });
        targetWeek = latest?.weekOf;
      }

      if (!targetWeek) {
        return { repos: [], total: 0, totalPages: 0, weekOf: null };
      }

      const [repos, total] = await Promise.all([
        ctx.prisma.trendingRepo.findMany({
          where: { weekOf: targetWeek },
          orderBy: { starsGrowth: 'desc' },
          skip,
          take: limit,
        }),
        ctx.prisma.trendingRepo.count({
          where: { weekOf: targetWeek },
        }),
      ]);

      return {
        repos,
        total,
        totalPages: Math.ceil(total / limit),
        weekOf: targetWeek.toISOString(),
      };
    }),

  /** Delete a trending repo by ID */
  trendingDelete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const repo = await ctx.prisma.trendingRepo.delete({
        where: { id: input.id },
      });
      if (ctx.revalidateTag) {
        ctx.revalidateTag('trending');
      }
      return repo;
    }),
});
