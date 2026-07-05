'use client';

import { useCallback, useEffect, useState } from 'react';

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
  const [fetchResult, setFetchResult] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editZh, setEditZh] = useState('');
  const [editEn, setEditEn] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRepos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trpc/admin.trendingList?batch=1');
      const data = await res.json();
      const result = data[0]?.result?.data?.json;
      setRepos(result?.repos ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

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
        setFetchResult(`✅ Fetched ${result.count} repos for week of ${new Date(result.weekOf).toLocaleDateString()}`);
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
      setRepos((prev) =>
        prev.map((r) =>
          r.id === editingId ? { ...r, summaryZh: editZh || null, summaryEn: editEn || null } : r,
        ),
      );
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
      setRepos((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">🔥 AI Trending</h1>
          <p className="text-sm text-[var(--portal-color-text-secondary)] mt-1">
            Fetch trending AI/LLM repos from GitHub and manage AI summaries.
          </p>
        </div>
        <button
          onClick={handleFetch}
          disabled={fetching}
          className="shrink-0 px-4 py-2 rounded-lg bg-[var(--portal-color-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {fetching ? 'Fetching...' : '🔄 Fetch from GitHub'}
        </button>
      </div>

      {fetchResult && (
        <div className="mb-4 rounded-lg bg-[var(--portal-color-surface)] border border-compat p-3 text-sm">
          {fetchResult}
        </div>
      )}

      {/* Repos List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-compat p-4 space-y-2">
              <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : repos.length === 0 ? (
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-12 text-center">
          <p className="text-[var(--portal-color-text-secondary)]">
            No trending repos yet. Click &quot;Fetch from GitHub&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="rounded-lg border border-compat bg-[var(--portal-color-surface)] p-4"
            >
              <div className="flex flex-col-reverse sm:flex-row sm:items-start justify-between gap-3 mb-3">
                {/* Repo Info */}
                <div className="min-w-0 flex-1">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[var(--portal-color-primary)] hover:underline break-all block"
                  >
                    {repo.fullName}
                  </a>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--portal-color-text-secondary)]">
                    <span>⭐ {repo.stars.toLocaleString()}{repo.starsGrowth > 0 && ` (+${repo.starsGrowth.toLocaleString()} this week)`}</span>
                    <span>🍴 {repo.forks.toLocaleString()}</span>
                    {repo.language && <span>🔤 {repo.language}</span>}
                  </div>
                </div>

                {/* Actions row: Aligned to the left on mobile, right on desktop */}
                <div className="flex justify-start sm:justify-end gap-2 shrink-0 self-start">
                  <button
                    onClick={() => (editingId === repo.id ? cancelEdit() : startEdit(repo))}
                    className="text-xs px-3 py-1.5 rounded-md border border-compat hover:bg-[var(--portal-color-background)] transition-colors text-[var(--portal-color-text-secondary)]"
                  >
                    {editingId === repo.id ? 'Cancel' : '✏️ Edit Summary'}
                  </button>
                  <button
                    onClick={() => handleDelete(repo.id)}
                    className="text-xs px-3 py-1.5 rounded-md border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {repo.description && (
                <p className="text-sm text-[var(--portal-color-text-secondary)] mb-2">
                  {repo.description}
                </p>
              )}

              {/* Existing summaries display */}
              {editingId !== repo.id && (repo.summaryZh || repo.summaryEn) && (
                <div className="mt-2 space-y-1 rounded-md bg-[var(--portal-color-background)] p-3">
                  {repo.summaryZh && (
                    <div>
                      <span className="text-xs font-semibold text-[var(--portal-color-primary)]">
                        中文摘要:
                      </span>
                      <p className="text-xs text-[var(--portal-color-text)] whitespace-pre-line mt-0.5">
                        {repo.summaryZh}
                      </p>
                    </div>
                  )}
                  {repo.summaryEn && (
                    <div className="mt-2">
                      <span className="text-xs font-semibold text-[var(--portal-color-primary)]">
                        English Summary:
                      </span>
                      <p className="text-xs text-[var(--portal-color-text)] whitespace-pre-line mt-0.5">
                        {repo.summaryEn}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Edit form */}
              {editingId === repo.id && (
                <div className="mt-3 space-y-3 rounded-md border border-compat p-3 bg-[var(--portal-color-background)]">
                  <div>
                    <label className="text-xs font-semibold text-[var(--portal-color-text-secondary)] block mb-1">
                      中文摘要 (Summary ZH)
                    </label>
                    <textarea
                      value={editZh}
                      onChange={(e) => setEditZh(e.target.value)}
                      rows={4}
                      placeholder="他是什么；他能解决什么问题；他能应用到什么地方"
                      className="w-full rounded-md border border-compat bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--portal-color-primary)]/30 resize-y"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--portal-color-text-secondary)] block mb-1">
                      English Summary
                    </label>
                    <textarea
                      value={editEn}
                      onChange={(e) => setEditEn(e.target.value)}
                      rows={4}
                      placeholder="What it is; What problems it solves; Application examples"
                      className="w-full rounded-md border border-compat bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--portal-color-primary)]/30 resize-y"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveSummary}
                      disabled={saving}
                      className="px-4 py-1.5 rounded-md bg-[var(--portal-color-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-1.5 rounded-md border border-compat text-sm text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-surface)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
