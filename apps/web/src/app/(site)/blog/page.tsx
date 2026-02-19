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
        <div style={{ padding: '5rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            {/* Section header */}
            <div className="flex items-baseline" style={{ gap: '.8rem', marginBottom: '2.5rem' }}>
                <span style={{ width: 28, height: 2, background: 'var(--portal-color-primary)', flexShrink: 0 }}></span>
                <span className="font-mono uppercase text-[var(--portal-color-primary)]"
                    style={{ fontSize: '.7rem', fontWeight: 500, letterSpacing: '.1em' }}
                >Latest Posts</span>
                <h1 className="text-[var(--portal-color-text)]"
                    style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.03em' }}
                >Blog</h1>
            </div>

            {/* Category Filters */}
            <div className="mb-8 flex flex-wrap gap-2">
                <a
                    href="/blog"
                    className={`rounded-full transition-colors ${!params.category
                        ? 'bg-[var(--portal-color-primary)] text-white'
                        : 'border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]'
                        }`}
                    style={{ padding: '.3rem .85rem', fontSize: '.78rem', fontWeight: 500 }}
                >
                    All
                </a>
                {categories.map((cat) => (
                    <a
                        key={cat.id}
                        href={`/blog?category=${cat.slug}`}
                        className={`rounded-full transition-colors ${params.category === cat.slug
                            ? 'bg-[var(--portal-color-primary)] text-white'
                            : 'border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]'
                            }`}
                        style={{ padding: '.3rem .85rem', fontSize: '.78rem', fontWeight: 500 }}
                    >
                        {cat.name} ({cat._count.posts})
                    </a>
                ))}
            </div>

            {/* Post List */}
            {data.posts.length > 0 ? (
                <div className="flex flex-col">
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
                            className="rounded-full border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-primary)]"
                            style={{ padding: '.4rem 1rem', fontSize: '.82rem' }}
                        >
                            ← Previous
                        </a>
                    )}
                    <span style={{ fontSize: '.82rem' }} className="text-[var(--portal-color-text-secondary)]">
                        Page {page} of {data.pagination.totalPages}
                    </span>
                    {page < data.pagination.totalPages && (
                        <a
                            href={`/blog?page=${page + 1}${params.category ? `&category=${params.category}` : ''}`}
                            className="rounded-full border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-primary)]"
                            style={{ padding: '.4rem 1rem', fontSize: '.82rem' }}
                        >
                            Next →
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
