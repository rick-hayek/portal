'use client';

import { useCallback, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { PostCard } from '@/components/blog/PostCard';
import { useLocalSWR } from '@/hooks/useLocalSWR';
import { Link } from '@/i18n/routing';
import { getCategoryName } from '@/lib/category';

interface Category {
  id: string;
  name: string;
  name_en?: string | null;
  slug: string;
  _count: {
    posts: number;
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: string;
  authorId: string;
  categoryId: string;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface BlogData {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function BlogList() {
  const t = useTranslations('Blog');
  const locale = useLocale();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || undefined;
  const tag = searchParams.get('tag') || undefined;

  // 1. Fetch Blog posts
  const { data: blogData, loading: loadingPosts } = useLocalSWR<BlogData>(
    `blog-posts-page-${page}-cat-${category || 'all'}-tag-${tag || 'all'}`,
    useCallback(async () => {
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(page));
      queryParams.set('limit', '10');
      if (category) queryParams.set('categorySlug', category);
      if (tag) queryParams.set('tagSlug', tag);

      const res = await fetch(
        '/api/trpc/post.list?batch=1&input=' +
          encodeURIComponent(
            JSON.stringify({
              '0': {
                json: {
                  page,
                  limit: 10,
                  categorySlug: category,
                  tagSlug: tag,
                },
              },
            })
          )
      );
      const json = await res.json();
      return json[0]?.result?.data?.json as BlogData;
    }, [page, category, tag])
  );

  // 2. Fetch categories
  const { data: categoriesData, mutate: mutateCategories } = useLocalSWR<Category[]>(
    'blog-categories',
    useCallback(async () => {
      const res = await fetch(
        '/api/trpc/category.list?batch=1&input=' +
          encodeURIComponent(JSON.stringify({ '0': { json: null } }))
      );
      const json = await res.json();
      return (json[0]?.result?.data?.json ?? []) as Category[];
    }, [])
  );

  // Revalidate categories whenever the query params change (e.g. user toggles categories)
  useEffect(() => {
    mutateCategories();
  }, [page, category, tag, mutateCategories]);

  const posts = blogData?.posts ?? [];
  const pagination = blogData?.pagination ?? { totalPages: 1 };
  const categories = categoriesData ?? [];

  // Helper to handle filter URLs
  const getFilterUrl = (catSlug?: string) => {
    if (catSlug) {
      return `/blog?category=${catSlug}`;
    }
    return '/blog';
  };

  const getPageUrl = (targetPage: number) => {
    let url = `/blog?page=${targetPage}`;
    if (category) url += `&category=${category}`;
    if (tag) url += `&tag=${tag}`;
    return url;
  };

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
        <Link
          href={getFilterUrl()}
          className={`rounded-full shrink-0 transition-colors ${!category
              ? 'bg-[var(--portal-color-primary)] text-white'
              : 'border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]'
            }`}
          style={{ padding: '.3rem .85rem', fontSize: '.78rem', fontWeight: 500 }}
        >
          {t('all')}
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={getFilterUrl(cat.slug)}
            className={`rounded-full shrink-0 transition-colors ${category === cat.slug
                ? 'bg-[var(--portal-color-primary)] text-white'
                : 'border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]'
              }`}
            style={{ padding: '.3rem .85rem', fontSize: '.78rem', fontWeight: 500 }}
          >
            {getCategoryName(cat, locale)} ({cat._count.posts})
          </Link>
        ))}
      </div>

      {/* Post List */}
      {loadingPosts && posts.length === 0 ? (
        // Skeleton loader
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-[var(--portal-color-border)] p-6 bg-[var(--portal-color-surface)]"
            >
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3 dark:bg-gray-800"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 dark:bg-gray-800"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 dark:bg-gray-800"></div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="flex flex-col">
          {posts.map((post) => (
            <PostCard key={post.id} post={post as any} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-[var(--portal-color-text-secondary)]">
          {t('noPosts')}
        </p>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          {page > 1 && (
            <Link
              href={getPageUrl(page - 1)}
              className="rounded-full border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-primary)]"
              style={{ padding: '.4rem 1rem', fontSize: '.82rem' }}
            >
              {t('previous')}
            </Link>
          )}
          <span
            style={{ fontSize: '.82rem' }}
            className="text-[var(--portal-color-text-secondary)]"
          >
            {t('pageOffset', { page, totalPages: pagination.totalPages })}
          </span>
          {page < pagination.totalPages && (
            <Link
              href={getPageUrl(page + 1)}
              className="rounded-full border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-primary)]"
              style={{ padding: '.4rem 1rem', fontSize: '.82rem' }}
            >
              {t('next')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
