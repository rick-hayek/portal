import { ensurePostsIndex, meili, POSTS_INDEX } from '../../search';
import { adminProcedure, router } from '../../trpc';

export const adminSearchRouter = router({
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
});
