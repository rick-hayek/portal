import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BlogList } from '@/components/blog/BlogList';
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
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Set requested locale for translation mappings
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="pt-8 md:pt-24 pb-12 md:pb-20 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
          {/* Header Skeleton */}
          <div className="flex items-baseline mb-[2.5rem]" style={{ gap: '.8rem' }}>
            <span
              style={{ width: 28, height: 2, background: 'var(--portal-color-primary)', flexShrink: 0 }}
            ></span>
            <span className="h-4 bg-gray-200 rounded w-16 dark:bg-gray-800 animate-pulse"></span>
            <span className="h-6 bg-gray-200 rounded w-24 dark:bg-gray-800 animate-pulse"></span>
          </div>

          {/* Categories Filters Skeleton */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-8 w-16 bg-gray-200 rounded-full dark:bg-gray-800 animate-pulse shrink-0"
              ></div>
            ))}
          </div>

          {/* Post List Skeleton */}
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
        </div>
      }
    >
      <BlogList />
    </Suspense>
  );
}
