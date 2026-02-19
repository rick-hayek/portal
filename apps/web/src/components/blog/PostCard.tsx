import type { PostWithRelations } from '@portal/api';

export function PostCard({ post }: { post: PostWithRelations }) {
    return (
        <a
            href={`/blog/${post.slug}`}
            className="group grid items-baseline text-inherit no-underline transition-all hover:bg-[var(--portal-color-primary)]/5 hover:border-transparent"
            style={{
                gridTemplateColumns: '80px 1fr auto',
                gap: '1.5rem',
                padding: '1.2rem 1rem',
                borderBottom: '1px solid var(--portal-color-border-soft)',
                borderRadius: 12,
            }}
        >
            {/* Date */}
            <span className="font-mono text-[var(--portal-color-text-secondary)]"
                style={{ fontSize: '.72rem', whiteSpace: 'nowrap' }}
            >
                {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—'}
            </span>

            {/* Content */}
            <div>
                {post.category && (
                    <span className="mb-1 inline-block uppercase text-[var(--portal-color-primary)]"
                        style={{ fontSize: '.6rem', fontWeight: 600, letterSpacing: '.08em', padding: '.1rem .5rem', background: 'rgba(107,142,201,.08)', borderRadius: 6 }}
                    >
                        {post.category.name}
                    </span>
                )}
                <div className="text-[var(--portal-color-text)]"
                    style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-.02em' }}
                >
                    {post.title}
                </div>
                {post.excerpt && (
                    <div className="text-[var(--portal-color-text-secondary)]"
                        style={{ fontSize: '.82rem', marginTop: '.2rem', lineHeight: 1.6 }}
                    >
                        {post.excerpt}
                    </div>
                )}
                {post.tags.length > 0 && (
                    <div className="flex font-mono" style={{ gap: '.3rem', marginTop: '.4rem' }}>
                        {post.tags.map(({ tag }) => (
                            <span
                                key={tag.id}
                                className="border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)]"
                                style={{ fontSize: '.6rem', padding: '.1rem .35rem', borderRadius: 4 }}
                            >
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Arrow */}
            <span className="text-[var(--portal-color-primary)] opacity-0 transition-all -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                style={{ fontSize: 18 }}
            >
                →
            </span>
        </a>
    );
}
