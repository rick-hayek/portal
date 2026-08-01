import { z } from 'zod';
import { meili, POSTS_INDEX } from '../search';
import { publicProcedure, router } from '../trpc';

export const searchRouter = router({
  /** Full-text search across posts */
  query: publicProcedure
    .input(
      z.object({
        q: z.string().min(1).max(200),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      // 1. Search posts
      let postHits: any[] = [];
      let postTotal = 0;

      try {
        const result = await meili.index(POSTS_INDEX).search(input.q, {
          offset: (input.page - 1) * input.limit,
          limit: input.limit,
          attributesToHighlight: ['title', 'excerpt'],
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
          filter: ['status = published'],
        });

        postHits = result.hits.map((hit) => ({
          id: hit.id as string,
          title: hit.title as string,
          slug: hit.slug as string,
          excerpt: hit.excerpt as string,
          categoryName: hit.categoryName as string,
          publishedAt: hit.publishedAt as string | null,
          type: 'post' as const,
          subtitle: hit.categoryName as string,
          _highlight: hit._formatted as Record<string, string> | undefined,
        }));
        postTotal = result.estimatedTotalHits ?? 0;
      } catch (err) {
        console.warn('MeiliSearch search failed, falling back to database query:', err);

        const where = {
          status: 'published' as const,
          OR: [
            { title: { contains: input.q, mode: 'insensitive' as const } },
            { content: { contains: input.q, mode: 'insensitive' as const } },
            { excerpt: { contains: input.q, mode: 'insensitive' as const } },
          ],
        };

        const [posts, total] = await Promise.all([
          ctx.prisma.post.findMany({
            where,
            skip: (input.page - 1) * input.limit,
            take: input.limit,
            orderBy: { publishedAt: 'desc' },
            include: {
              category: { select: { name: true, name_en: true } },
            },
          }),
          ctx.prisma.post.count({ where }),
        ]);

        postHits = posts.map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? '',
          categoryName: post.category?.name ?? '',
          publishedAt: post.publishedAt?.toISOString() ?? null,
          type: 'post' as const,
          subtitle: post.category?.name ?? '',
          _highlight: undefined,
        }));
        postTotal = total;
      }

      // 2. Query books and projects in parallel from the database
      const [books, projects] = await Promise.all([
        ctx.prisma.book.findMany({
          where: {
            OR: [
              { title: { contains: input.q, mode: 'insensitive' } },
              { author: { contains: input.q, mode: 'insensitive' } },
            ],
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.project.findMany({
          where: {
            title: { contains: input.q, mode: 'insensitive' },
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const bookHits = books.map((book) => ({
        id: book.id,
        title: book.title,
        slug: book.slug,
        excerpt: book.description ?? '',
        categoryName: 'Book',
        publishedAt: book.publishYear,
        type: 'book' as const,
        subtitle: book.author ? `by ${book.author}` : '',
        _highlight: undefined,
      }));

      const projectHits = projects.map((project) => ({
        id: project.id,
        title: project.title,
        slug: project.slug,
        excerpt: project.description ?? '',
        categoryName: 'Project',
        publishedAt: null,
        type: 'portfolio' as const,
        subtitle: Array.isArray(project.techStack) ? project.techStack.join(', ') : '',
        _highlight: undefined,
      }));

      // Combine all results
      const allHits = [...postHits, ...projectHits, ...bookHits];

      return {
        hits: allHits,
        totalHits: postTotal + projects.length + books.length,
        query: input.q,
        page: input.page,
      };
    }),
});
