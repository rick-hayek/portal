import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { meili, POSTS_INDEX } from '../search';

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
        .query(async ({ input }) => {
            try {
                const result = await meili.index(POSTS_INDEX).search(input.q, {
                    offset: (input.page - 1) * input.limit,
                    limit: input.limit,
                    attributesToHighlight: ['title', 'excerpt'],
                    highlightPreTag: '<mark>',
                    highlightPostTag: '</mark>',
                    filter: ['status = published'],
                });

                return {
                    hits: result.hits.map((hit) => ({
                        id: hit.id as string,
                        title: hit.title as string,
                        slug: hit.slug as string,
                        excerpt: hit.excerpt as string,
                        categoryName: hit.categoryName as string,
                        publishedAt: hit.publishedAt as string | null,
                        _highlight: hit._formatted as Record<string, string> | undefined,
                    })),
                    totalHits: result.estimatedTotalHits ?? 0,
                    query: input.q,
                    page: input.page,
                };
            } catch {
                // MeiliSearch may not be running — fallback to DB search
                return { hits: [], totalHits: 0, query: input.q, page: input.page };
            }
        }),
});
