import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { AdSense } from '@/components/blog/AdSense';
import { CommentSection } from '@/components/blog/CommentSection';
import { CustomBlockquote } from '@/components/blog/CustomBlockquote';
import { Link } from '@/i18n/routing';
import { getTRPCServer } from '@/lib/trpc-server';
import siteConfig from '@/site.config';

export const revalidate = 3600; // revalidate at most every hour (ISR)

export async function generateStaticParams() {
  const trpc = await getTRPCServer();
  // Pre-render the first 50 posts
  const data = await trpc.post.list({ page: 1, limit: 50 });
  const locales = ['en', 'zh'];

  return locales.flatMap((locale) =>
    data.posts.map((post) => ({
      locale,
      slug: post.slug,
    })),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trpc = await getTRPCServer();
  const post = await trpc.post.bySlug({ slug });
  if (!post) return { title: 'Not Found' };
  return {
    title: `${post.title} — ${siteConfig.site.title}`,
    description: post.excerpt ?? '',
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // Set request locale for static/ISR rendering in next-intl
  setRequestLocale(locale);

  const trpc = await getTRPCServer();
  const post = await trpc.post.bySlug({ slug });
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: 'Navigation' });

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name || 'Rick Huang',
      image: post.author.image || '',
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.site.title,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.site.url}/icon.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.site.url}/${locale}/blog/${post.slug}`,
    },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Load KaTeX stylesheet from CDN to avoid compiling local font assets */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.css"
        integrity="sha384-vlBdW0r3AcZO/HboRPznQNowvexd3fY8qHOWkBi5q7KGgqJ+F48+DceybYmrVbmB"
        crossOrigin="anonymous"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      {/* Back Button */}
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-primary)] transition-colors no-underline"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {t('blog')}
      </Link>

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
            <Image
              src={post.author.image}
              alt={post.author.name ?? ''}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
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
          components={{
            AdSense,
            blockquote: CustomBlockquote,
          }}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, remarkMath],
              rehypePlugins: [rehypeHighlight, rehypeSlug, rehypeKatex],
            },
          }}
        />
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} comments={post.comments} />
    </article>
  );
}
