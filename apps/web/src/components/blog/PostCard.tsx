interface PostAuthor {
    id: string;
    name: string | null;
    image: string | null;
}

interface PostCategory {
    id: string;
    name: string;
    slug: string;
}

interface PostTag {
    tag: { id: string; name: string; slug: string };
}

interface PostWithRelations {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: Date | null;
    author: PostAuthor;
    category: PostCategory | null;
    tags: PostTag[];
}

export function PostCard({ post }: { post: PostWithRelations }) {
    return (
        <article className="group rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 transition-all hover:border-[var(--portal-color-primary)] hover:shadow-lg">
            <a href={`/blog/${post.slug}`} className="block">
                {/* Category & Date */}
                <div className="mb-3 flex items-center gap-3 text-xs text-[var(--portal-color-text-secondary)]">
                    {post.category && (
                        <span className="rounded-full bg-[var(--portal-color-primary)] px-2 py-0.5 text-white">
                            {post.category.name}
                        </span>
                    )}
                    {post.publishedAt && (
                        <time dateTime={post.publishedAt.toISOString()}>
                            {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
                        </time>
                    )}
                </div>

                {/* Title */}
                <h2 className="mb-2 text-xl font-bold text-[var(--portal-color-text)] transition-colors group-hover:text-[var(--portal-color-primary)]">
                    {post.title}
                </h2>

                {/* Excerpt */}
                {post.excerpt && (
                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--portal-color-text-secondary)]">
                        {post.excerpt}
                    </p>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map(({ tag }) => (
                            <span
                                key={tag.id}
                                className="rounded-md border border-[var(--portal-color-border)] px-2 py-0.5 text-xs text-[var(--portal-color-text-secondary)]"
                            >
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </a>
        </article>
    );
}
