import { MeiliSearch } from 'meilisearch';

const MEILI_URL = process.env.MEILISEARCH_URL ?? 'http://localhost:7700';
const MEILI_KEY = process.env.MEILISEARCH_KEY ?? '';

export const meili = new MeiliSearch({
    host: MEILI_URL,
    apiKey: MEILI_KEY,
});

export const POSTS_INDEX = 'posts';

/** Ensure posts index exists with correct settings */
export async function ensurePostsIndex() {
    try {
        await meili.getIndex(POSTS_INDEX);
    } catch {
        await meili.createIndex(POSTS_INDEX, { primaryKey: 'id' });
    }

    await meili.index(POSTS_INDEX).updateSettings({
        searchableAttributes: ['title', 'excerpt', 'content', 'categoryName'],
        filterableAttributes: ['status', 'categorySlug'],
        sortableAttributes: ['publishedAt', 'title'],
        displayedAttributes: ['id', 'title', 'slug', 'excerpt', 'categoryName', 'categorySlug', 'publishedAt'],
    });
}

/** Sync a post to MeiliSearch */
export async function indexPost(post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    status: string;
    publishedAt: Date | null;
    category?: { name: string; slug: string } | null;
}) {
    await meili.index(POSTS_INDEX).addDocuments([{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? '',
        content: post.content,
        status: post.status,
        categoryName: post.category?.name ?? '',
        categorySlug: post.category?.slug ?? '',
        publishedAt: post.publishedAt?.toISOString() ?? null,
    }]);
}

/** Remove a post from the index */
export async function removePostFromIndex(postId: string) {
    await meili.index(POSTS_INDEX).deleteDocument(postId);
}
