'use client';

import { useEffect } from 'react';

export default function BlogErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Blog Page Error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg-secondary)] p-8 shadow-sm">
        <h2 className="mb-3 text-2xl font-bold text-[var(--portal-color-text)]">
          文章加载异常 (Article Load Error)
        </h2>
        <p className="mb-6 text-sm text-[var(--portal-color-text-secondary)]">
          抱歉，该文章在渲染过程中遇到了临时异常。我们的系统已自动捕获此问题。
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-[var(--portal-color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            重试加载
          </button>
          <a
            href="/blog"
            className="rounded-lg border border-[var(--portal-color-border)] px-4 py-2 text-sm font-medium text-[var(--portal-color-text)] hover:bg-[var(--portal-color-bg-hover)] transition-colors"
          >
            返回博客列表
          </a>
        </div>
      </div>
    </div>
  );
}
