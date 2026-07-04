import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { PostCard } from '@/components/blog/PostCard';
import { getTRPCServer } from '@/lib/trpc-server';
import siteConfig from '@/site.config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  return {
    title: `${t('title')} — ${siteConfig.site.title}`,
    description: t('latestPosts'),
  };
}

export default async function BlogPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ page?: string; category?: string; tag?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const sParams = await searchParams;
  const { locale } = await params;
  const page = Number(sParams.page) || 1;
  const t = await getTranslations({ locale, namespace: 'Blog' });

  const trpc = await getTRPCServer();

  const [data, categories] = await Promise.all([
    trpc.post.list({
      page,
      limit: 10,
      categorySlug: sParams.category,
      tagSlug: sParams.tag,
    }),
    trpc.category.list(),
  ]);

  return (
    <div className="pt-8 md:pt-24 pb-12 md:pb-20 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
      {/* Section header */}
      <div className="flex items-baseline" style={{ gap: '.8rem', marginBottom: '2.5rem' }}>
        <span
          style={{ width: 28, height: 2, background: 'var(--portal-color-primary)', flexShrink: 0 }}
        ></span>
        <span
          className="font-mono uppercase text-[var(--portal-color-primary)]"
          style={{ fontSize: '.7rem', fontWeight: 500, letterSpacing: '.1em' }}
        >
          {t('latestPosts')}
        </span>
        <h1
          className="text-[var(--portal-color-text)]"
          style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.03em' }}
        >
          {t('title')}
        </h1>
      </div>

      {/* Category Filters */}
      <div
        className="mb-8 flex flex-nowrap overflow-x-auto md:flex-wrap md:overflow-visible pb-2 md:pb-0 gap-2 scrollbar-none"
        style={{
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <a
          href="/blog"
          className={`rounded-full shrink-0 transition-colors ${!sParams.category
              ? 'bg-[var(--portal-color-primary)] text-white'
              : 'border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]'
            }`}
          style={{ padding: '.3rem .85rem', fontSize: '.78rem', fontWeight: 500 }}
        >
          {t('all')}
        </a>
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/blog?category=${cat.slug}`}
            className={`rounded-full shrink-0 transition-colors ${sParams.category === cat.slug
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
          {t('noPosts')}
        </p>
      )}

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          {page > 1 && (
            <a
              href={`/blog?page=${page - 1}${sParams.category ? `&category=${sParams.category}` : ''}`}
              className="rounded-full border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-primary)]"
              style={{ padding: '.4rem 1rem', fontSize: '.82rem' }}
            >
              {t('previous')}
            </a>
          )}
          <span
            style={{ fontSize: '.82rem' }}
            className="text-[var(--portal-color-text-secondary)]"
          >
            {t('pageOffset', { page, totalPages: data.pagination.totalPages })}
          </span>
          {page < data.pagination.totalPages && (
            <a
              href={`/blog?page=${page + 1}${sParams.category ? `&category=${sParams.category}` : ''}`}
              className="rounded-full border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-primary)]"
              style={{ padding: '.4rem 1rem', fontSize: '.82rem' }}
            >
              {t('next')}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
