export default function BlogLoading() {
  return (
    <div className="pt-8 md:pt-24 pb-12 md:pb-20 px-4 md:px-8 max-w-[1200px] mx-auto w-full animate-pulse">
      {/* Section header skeleton */}
      <div className="flex items-baseline mb-10 gap-3">
        <span className="w-7 h-[2px] bg-[var(--portal-color-primary)] shrink-0 opacity-50" />
        <span className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-7 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>

      {/* Category filter skeleton */}
      <div className="mb-8 flex overflow-x-auto gap-2 pb-2">
        <div className="h-7 w-12 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0" />
        <div className="h-7 w-20 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0" />
        <div className="h-7 w-16 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0" />
        <div className="h-7 w-24 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0" />
      </div>

      {/* Blog post list skeleton */}
      <div className="flex flex-col gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="py-5 px-4 border-b border-compat-soft rounded-xl bg-[var(--portal-color-surface)] space-y-3"
          >
            <div className="flex gap-2 items-center">
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
            </div>
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
