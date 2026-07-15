'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
  category: { name: string } | null;
  _count: { comments: number };
}

interface PostListData {
  items: Post[];
  total: number;
  page: number;
  totalPages: number;
}

export default function PostsPage() {
  const [data, setData] = useState<PostListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [search, setSearch] = useState('');
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  useEffect(() => {
    if (!isStatusOpen) return;
    const closeMenu = () => setIsStatusOpen(false);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [isStatusOpen]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const input: Record<string, unknown> = { page, limit: 20, status };
      if (search) input.search = search;
      const res = await fetch(
        `/api/trpc/admin.postList?batch=1&input=${encodeURIComponent(JSON.stringify({ '0': { json: input } }))}`,
      );
      const json = await res.json();
      setData(json[0]?.result?.data?.json);
    } catch (e) {
      console.error('Failed to load posts', e);
    }
    setLoading(false);
  }, [page, status, search]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await fetch('/api/trpc/admin.postDelete?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ '0': { json: { id } } }),
      });
      loadPosts();
    } catch (e) {
      console.error('Delete failed', e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-lg bg-[var(--portal-color-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search posts…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
        />
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsStatusOpen(!isStatusOpen);
            }}
            className="flex items-center justify-between gap-2 cursor-pointer rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--portal-color-primary)]"
            aria-label="Filter by status"
          >
            <span className="font-[500]">
              {
                {
                  all: 'All Status',
                  published: 'Published',
                  draft: 'Draft',
                }[status]
              }
            </span>
            <svg
              className={`h-3 w-3 text-[var(--portal-color-text-secondary)] transition-transform duration-200 ${
                isStatusOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <title>Dropdown arrow</title>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isStatusOpen && (
            <div className="absolute right-0 top-full z-50 mt-1.5 w-36 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]/95 backdrop-blur-md py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
              {(['all', 'published', 'draft'] as const).map((opt) => {
                const label = {
                  all: 'All Status',
                  published: 'Published',
                  draft: 'Draft',
                }[opt];
                const isActive = status === opt;

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setStatus(opt);
                      setPage(1);
                      setIsStatusOpen(false);
                    }}
                    className={`flex w-full items-center px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[var(--portal-color-surface-alt)] font-semibold text-[var(--portal-color-primary)]'
                        : 'text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-surface-alt)] hover:text-[var(--portal-color-text)]'
                    }`}
                  >
                    <span className="w-5 text-center shrink-0 mr-1 text-[10px] font-bold">
                      {isActive && '✓'}
                    </span>
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--portal-color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--portal-color-surface)]">
            <tr className="border-b border-[var(--portal-color-border)]">
              <th className="px-4 py-3 text-left font-medium text-[var(--portal-color-text-secondary)]">
                Title
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-[var(--portal-color-text-secondary)]">
                Category
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-[var(--portal-color-text-secondary)]">
                Status
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-[var(--portal-color-text-secondary)]">
                Comments
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-[var(--portal-color-text-secondary)]">
                Updated
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--portal-color-text-secondary)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items do not have custom id
                <tr key={i} className="border-b border-[var(--portal-color-border)]">
                  <td colSpan={6} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-[var(--portal-color-border)]" />
                  </td>
                </tr>
              ))
            ) : data?.items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-[var(--portal-color-text-secondary)]"
                >
                  No posts found.
                </td>
              </tr>
            ) : (
              data?.items.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-[var(--portal-color-border)] hover:bg-[var(--portal-color-surface)]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-medium text-[var(--portal-color-text)] hover:text-[var(--portal-color-primary)]"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-[var(--portal-color-text-secondary)]">
                    {post.category?.name ?? '—'}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-[var(--portal-color-text-secondary)]">
                    {post._count.comments}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-[var(--portal-color-text-secondary)]">
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 sm:gap-2">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-compat text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] transition-colors no-underline"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </a>
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-compat text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] transition-colors no-underline"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--portal-color-text-secondary)]">
            Showing page {data.page} of {data.totalPages} ({data.total} total)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-[var(--portal-color-border)] px-3 py-1.5 text-sm disabled:opacity-50"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className="rounded-lg border border-[var(--portal-color-border)] px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
