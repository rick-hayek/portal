export default function BlogPostLoading() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 animate-pulse">
      {/* Back Button Skeleton */}
      <div className="mb-8 h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />

      {/* Header Skeleton */}
      <header className="mb-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
        {/* Author skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </header>

      {/* Content Skeleton */}
      <div className="space-y-4 border-t border-compat pt-8">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
        <br />
        <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-800 rounded" />
        <br />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
    </article>
  );
}
