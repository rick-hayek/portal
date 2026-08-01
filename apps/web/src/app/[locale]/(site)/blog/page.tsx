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
        <div className="pt-8 md:pt-16 pb-12 md:pb-20 px-4 md:px-8 max-w-[1140px] mx-auto w-full">
          {/* Header Skeleton */}
          <div className="flex items-baseline mb-6 md:mb-8" style={{ gap: '.8rem' }}>
            <span
              style={{ width: 28, height: 2, background: 'var(--portal-color-primary)', flexShrink: 0 }}
            ></span>
            <span className="h-4 bg-gray-200 rounded w-16 dark:bg-gray-800 animate-pulse"></span>
            <span className="h-6 bg-gray-200 rounded w-24 dark:bg-gray-800 animate-pulse"></span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-12 items-start">
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

            {/* Sidebar Skeleton */}
            <div className="hidden lg:flex flex-col gap-6">
              <div className="animate-pulse rounded-2xl border border-[var(--portal-color-border)] p-5 bg-[var(--portal-color-surface)] h-48"></div>
              <div className="animate-pulse rounded-2xl border border-[var(--portal-color-border)] p-5 bg-[var(--portal-color-surface)] h-48"></div>
            </div>
          </div>
        </div>
      }
    >
      <BlogList />
    </Suspense>
  );
}
