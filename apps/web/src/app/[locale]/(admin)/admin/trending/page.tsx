'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2, ExternalLink, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface TrendingRepo {
  id: string;
  githubId: number;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  starsGrowth: number;
  repoCreatedAt: string;
  topics: string[];
  summaryZh: string | null;
  summaryEn: string | null;
  weekOf: string;
}

export default function AdminTrendingPage() {
  const [repos, setRepos] = useState<TrendingRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [refreshingCache, setRefreshingCache] = useState(false);
  const [fetchResult, setFetchResult] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editZh, setEditZh] = useState('');
  const [editEn, setEditEn] = useState('');
  const [saving, setSaving] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadRepos = useCallback(async () => {
    setLoading(true);
    try {
      const inputStr = JSON.stringify({
        '0': {
          json: { page, limit: 20 },
        },
      });
      const res = await fetch(
        `/api/trpc/admin.trendingList?batch=1&input=${encodeURIComponent(inputStr)}`,
      );
      const data = await res.json();
      const result = data[0]?.result?.data?.json;
      setRepos(result?.repos ?? []);
      setTotalPages(result?.totalPages ?? 1);
      setTotal(result?.total ?? 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadRepos();
  }, [loadRepos]);

  const handleFetch = async () => {
    setFetching(true);
    setFetchResult('');
    try {
      const res = await fetch('/api/trpc/admin.trendingFetch?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ '0': { json: {} } }),
      });
      const data = await res.json();
      const result = data[0]?.result?.data?.json;
      if (result?.success) {
        setFetchResult(
          `✅ Fetched ${result.count} repos for week of ${new Date(result.weekOf).toLocaleDateString()}`,
        );
        setPage(1);
        loadRepos();
      } else {
        setFetchResult('❌ Fetch failed');
      }
    } catch (e: any) {
      setFetchResult(`❌ Error: ${e?.message ?? 'Unknown error'}`);
    } finally {
      setFetching(false);
    }
  };

  const handleRefreshCache = async () => {
    setRefreshingCache(true);
    setFetchResult('');
    try {
      const res = await fetch('/api/trpc/admin.trendingCacheRefresh?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ '0': { json: {} } }),
      });
      const data = await res.json();
      const result = data[0]?.result?.data?.json;
      if (result?.success) {
        setFetchResult('✅ Server cache refreshed successfully');
        loadRepos();
      } else {
        setFetchResult('❌ Cache refresh failed');
      }
    } catch (e: any) {
      setFetchResult(`❌ Error: ${e?.message ?? 'Unknown error'}`);
    } finally {
      setRefreshingCache(false);
    }
  };

  const startEdit = (repo: TrendingRepo) => {
    setEditingId(repo.id);
    setEditZh(repo.summaryZh ?? '');
    setEditEn(repo.summaryEn ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditZh('');
    setEditEn('');
  };

  const saveSummary = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await fetch('/api/trpc/admin.trendingUpdate?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: {
              id: editingId,
              summaryZh: editZh || undefined,
              summaryEn: editEn || undefined,
            },
          },
        }),
      });
      loadRepos();
      cancelEdit();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this repository from trending?')) return;
    try {
      await fetch('/api/trpc/admin.trendingDelete?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: { id },
          },
        }),
      });
      loadRepos();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--portal-color-text)] flex items-center gap-2">
            🔥 AI Trending
          </h1>
          <p className="text-sm text-[var(--portal-color-text-secondary)] mt-1">
            Fetch trending AI/LLM repos from GitHub and manage AI summaries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshCache}
            disabled={refreshingCache || fetching}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] text-[var(--portal-color-text)] text-sm font-medium hover:bg-[var(--portal-color-bg)]/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshingCache ? 'animate-spin' : ''}`} />
            {refreshingCache ? 'Refreshing...' : 'Refresh Cache'}
          </button>
          <button
            onClick={handleFetch}
            disabled={fetching || refreshingCache}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--portal-color-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
            {fetching ? 'Fetching...' : 'Fetch from GitHub'}
          </button>
        </div>
      </div>

      {fetchResult && (
        <div className="rounded-lg bg-[var(--portal-color-surface)] border border-compat p-3 text-sm text-[var(--portal-color-text)]">
          {fetchResult}
        </div>
      )}

      {/* Table view */}
      <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm table-fixed">
            <thead className="border-b border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] text-[var(--portal-color-text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium w-[45%] md:w-1/4">Repository</th>
                <th className="px-4 py-3 font-medium w-28 md:w-32">Stats</th>
                <th className="px-4 py-3 font-medium w-24 hidden md:table-cell">Language</th>
                <th className="px-4 py-3 font-medium w-5/12 hidden md:table-cell">AI Summaries</th>
                <th className="px-4 py-3 font-medium text-right w-24 md:w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--portal-color-border)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-[var(--portal-color-text-tertiary)]">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--portal-color-primary)] border-t-transparent" />
                      Loading repositories...
                    </div>
                  </td>
                </tr>
              ) : repos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[var(--portal-color-text-secondary)]">
                    No trending repos found for this week. Click &quot;Fetch from GitHub&quot; above.
                  </td>
                </tr>
              ) : (
                repos.map((repo) => (
                  <Fragment key={repo.id}>
                    <tr className="hover:bg-[var(--portal-color-bg)]/30 transition-colors align-top">
                      <td className="px-4 py-3">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[var(--portal-color-primary)] hover:underline inline-flex items-center gap-1 break-all"
                        >
                          {repo.fullName}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                        {repo.description && (
                          <p className="text-xs text-[var(--portal-color-text-secondary)] mt-1.5 line-clamp-2 hidden md:block">
                            {repo.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs space-y-1 text-[var(--portal-color-text-secondary)]">
                        <div>⭐ <span className="font-semibold text-[var(--portal-color-text)]">{repo.stars.toLocaleString()}</span></div>
                        {repo.starsGrowth > 0 && (
                          <div className="text-[10px] text-green-500 font-medium">
                            +{repo.starsGrowth.toLocaleString()} <span className="hidden md:inline">this week</span>
                          </div>
                        )}
                        <div className="hidden md:block">🍴 {repo.forks.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {repo.language ? (
                          <span className="inline-flex rounded-full bg-[var(--portal-color-border)] px-2.5 py-0.5 text-xs font-medium text-[var(--portal-color-text)]">
                            {repo.language}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--portal-color-text-tertiary)]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 space-y-2 hidden md:table-cell">
                        {repo.summaryZh ? (
                          <div className="text-xs">
                            <span className="font-medium text-[var(--portal-color-primary)]">ZH: </span>
                            <span className="text-[var(--portal-color-text)] line-clamp-3">{repo.summaryZh}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-[var(--portal-color-text-tertiary)] italic">No ZH summary</div>
                        )}
                        {repo.summaryEn ? (
                          <div className="text-xs">
                            <span className="font-medium text-[var(--portal-color-primary)]">EN: </span>
                            <span className="text-[var(--portal-color-text)] line-clamp-3">{repo.summaryEn}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-[var(--portal-color-text-tertiary)] italic">No EN summary</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingId !== repo.id && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(repo)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-compat text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(repo.id)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {editingId === repo.id && (
                      <tr className="bg-[var(--portal-color-bg)]/20">
                        <td colSpan={5} className="px-4 py-4">
                          <div className="space-y-3 p-4 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] shadow-inner">
                            <h3 className="text-xs font-bold text-[var(--portal-color-text)] uppercase tracking-wider mb-2">
                              Edit AI Summaries for {repo.fullName}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[11px] font-semibold text-[var(--portal-color-text-secondary)] block mb-1">
                                  中文摘要 (Summary ZH)
                                </label>
                                <textarea
                                  value={editZh}
                                  onChange={(e) => setEditZh(e.target.value)}
                                  rows={4}
                                  placeholder="它是什么；能解决什么；应用场景"
                                  className="w-full rounded border border-compat bg-[var(--portal-color-surface)] px-3 py-2 text-xs text-[var(--portal-color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--portal-color-primary)]"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-[var(--portal-color-text-secondary)] block mb-1">
                                  English Summary
                                </label>
                                <textarea
                                  value={editEn}
                                  onChange={(e) => setEditEn(e.target.value)}
                                  rows={4}
                                  placeholder="What it is; What problems it solves; Applications"
                                  className="w-full rounded border border-compat bg-[var(--portal-color-surface)] px-3 py-2 text-xs text-[var(--portal-color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--portal-color-primary)]"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={saveSummary}
                                disabled={saving}
                                className="px-4 py-2 rounded bg-[var(--portal-color-primary)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                              >
                                {saving ? 'Saving...' : 'Save Summary'}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-4 py-2 rounded border border-compat text-xs font-semibold text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-surface)]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-4 py-2 text-sm font-medium text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-4 py-2 text-sm font-medium text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[var(--portal-color-text-secondary)]">
                  Showing{' '}
                  <span className="font-semibold text-[var(--portal-color-text)]">
                    {(page - 1) * 20 + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-[var(--portal-color-text)]">
                    {Math.min(page * 20, total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-[var(--portal-color-text)]">{total}</span>{' '}
                  entries
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-[var(--portal-color-text-secondary)] ring-1 ring-inset ring-[var(--portal-color-border)] hover:bg-[var(--portal-color-bg)] focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pNum = idx + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setPage(pNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-[var(--portal-color-border)] focus:z-20 focus:outline-offset-0 ${
                          page === pNum
                            ? 'z-10 bg-[var(--portal-color-primary)] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--portal-color-primary)]'
                            : 'text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)]'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-[var(--portal-color-text-secondary)] ring-1 ring-inset ring-[var(--portal-color-border)] hover:bg-[var(--portal-color-bg)] focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
