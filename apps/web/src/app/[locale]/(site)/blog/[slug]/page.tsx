import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { trpc } from '@/lib/trpc-client';
import { CommentSection } from '@/components/blog/CommentSection';
import siteConfig from '@/site.config';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await trpc.post.bySlug.query({ slug });
    if (!post) return { title: 'Not Found' };
    return {
        title: `${post.title} — ${siteConfig.site.title}`,
        description: post.excerpt ?? '',
    };
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await trpc.post.bySlug.query({ slug });
    if (!post) notFound();

    return (
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            {/* Header */}
            <header className="mb-8">
                <div className="mb-3 flex items-center gap-3 text-sm text-[var(--portal-color-text-secondary)]">
                    {post.category && (
                        <a
                            href={`/blog?category=${post.category.slug}`}
                            className="rounded-full bg-[var(--portal-color-primary)] px-2.5 py-0.5 text-xs text-white hover:opacity-90"
                        >
                            {post.category.name}
                        </a>
                    )}
                    {post.publishedAt && (
                        <time dateTime={post.publishedAt.toISOString()}>
                            {new Date(post.publishedAt).toLocaleDateString('zh-CN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </time>
                    )}
                </div>

                <h1 className="mb-4 text-3xl font-bold leading-tight text-[var(--portal-color-text)] sm:text-4xl">
                    {post.title}
                </h1>

                {/* Author */}
                <div className="flex items-center gap-3">
                    {post.author.image && (
                        <img
                            src={post.author.image}
                            alt={post.author.name ?? ''}
                            className="h-10 w-10 rounded-full"
                        />
                    )}
                    <span className="text-sm text-[var(--portal-color-text-secondary)]">
                        {post.author.name}
                    </span>
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.map(({ tag }) => (
                            <a
                                key={tag.id}
                                href={`/blog?tag=${tag.slug}`}
                                className="rounded-md border border-[var(--portal-color-border)] px-2 py-0.5 text-xs text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]"
                            >
                                #{tag.name}
                            </a>
                        ))}
                    </div>
                )}
            </header>

            {/* Markdown Content */}
            <div className="prose prose-portal max-w-none">
                <MDXRemote
                    source={post.content}
                    options={{
                        mdxOptions: {
                            remarkPlugins: [remarkGfm],
                            rehypePlugins: [rehypeHighlight, rehypeSlug],
                        },
                    }}
                />
            </div>

            {/* Comments */}
            <CommentSection postId={post.id} comments={post.comments} />
        </article>
    );
}
