import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { BlogList } from '@/components/blog/BlogList';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  return {
    title: t('title'),
    description: t('latestPosts'),
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Set requested locale for translation mappings
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="pt-8 md:pt-16 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 mx-auto w-full max-w-[1536px]">
          <div className="flex justify-center items-start gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
            {/* Left Balance Spacer Skeleton */}
            <div
              className="hidden min-[1250px]:block shrink w-[200px] xl:w-[240px] 2xl:w-[280px] min-w-[180px] max-w-[280px]"
              aria-hidden="true"
            />

            {/* Post List Skeleton Column */}
            <div className="w-full max-w-3xl shrink min-w-0">
              {/* Header Skeleton */}
              <div className="flex items-baseline mb-6 md:mb-8" style={{ gap: '.8rem' }}>
                <span
                  style={{
                    width: 28,
                    height: 2,
                    background: 'var(--portal-color-primary)',
                    flexShrink: 0,
                  }}
                ></span>
                <span className="h-4 bg-gray-200 rounded w-16 dark:bg-gray-800 animate-pulse"></span>
                <span className="h-6 bg-gray-200 rounded w-24 dark:bg-gray-800 animate-pulse"></span>
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

            {/* Sidebar Skeleton Column */}
            <aside className="hidden lg:block shrink w-[200px] xl:w-[240px] 2xl:w-[280px] min-w-[180px] max-w-[280px] space-y-6">
              <div className="space-y-6">
                <div className="animate-pulse rounded-2xl border border-[var(--portal-color-border)] p-5 bg-[var(--portal-color-surface)] h-48"></div>
                <div className="animate-pulse rounded-2xl border border-[var(--portal-color-border)] p-5 bg-[var(--portal-color-surface)] h-48"></div>
              </div>
            </aside>
          </div>
        </div>
      }
    >
      <BlogList />
    </Suspense>
  );
}
