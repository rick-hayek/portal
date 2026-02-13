import siteConfig from '@/site.config';
import { trpc } from '@/lib/trpc-client';
import { PostCard } from '@/components/blog/PostCard';

export const metadata = {
    title: `Blog — ${siteConfig.site.title}`,
    description: 'Read the latest articles',
};

export default async function BlogPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; category?: string; tag?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;

    const data = await trpc.post.list.query({
        page,
        limit: 10,
        categorySlug: params.category,
        tagSlug: params.tag,
    });

    const categories = await trpc.category.list.query();

    return (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
            <h1 className="mb-8 text-3xl font-bold text-[var(--portal-color-text)]">Blog</h1>

            {/* Category Filters */}
            <div className="mb-8 flex flex-wrap gap-2">
                <a
                    href="/blog"
                    className={`rounded-full px-3 py-1 text-sm transition-colors ${!params.category
                            ? 'bg-[var(--portal-color-primary)] text-white'
                            : 'border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]'
                        }`}
                >
                    All
                </a>
                {categories.map((cat) => (
                    <a
                        key={cat.id}
                        href={`/blog?category=${cat.slug}`}
                        className={`rounded-full px-3 py-1 text-sm transition-colors ${params.category === cat.slug
                                ? 'bg-[var(--portal-color-primary)] text-white'
                                : 'border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]'
                            }`}
                    >
                        {cat.name} ({cat._count.posts})
                    </a>
                ))}
            </div>

            {/* Post Grid */}
            {data.posts.length > 0 ? (
                <div className="grid gap-6">
                    {data.posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <p className="py-12 text-center text-[var(--portal-color-text-secondary)]">
                    No posts found.
                </p>
            )}

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                    {page > 1 && (
                        <a
                            href={`/blog?page=${page - 1}${params.category ? `&category=${params.category}` : ''}`}
                            className="rounded-lg border border-[var(--portal-color-border)] px-4 py-2 text-sm transition-colors hover:border-[var(--portal-color-primary)]"
                        >
                            ← Previous
                        </a>
                    )}
                    <span className="text-sm text-[var(--portal-color-text-secondary)]">
                        Page {page} of {data.pagination.totalPages}
                    </span>
                    {page < data.pagination.totalPages && (
                        <a
                            href={`/blog?page=${page + 1}${params.category ? `&category=${params.category}` : ''}`}
                            className="rounded-lg border border-[var(--portal-color-border)] px-4 py-2 text-sm transition-colors hover:border-[var(--portal-color-primary)]"
                        >
                            Next →
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
