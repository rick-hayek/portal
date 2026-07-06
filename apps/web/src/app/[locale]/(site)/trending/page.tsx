'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

// GitHub language color mapping
const LANG_COLORS: Record<string, string> = {
  Python: '#3572A5',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Rust: '#dea584',
  Go: '#00ADD8',
  'C++': '#f34b7d',
  C: '#555555',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Ruby: '#701516',
  Shell: '#89e051',
  Jupyter: '#DA5B0B',
  Dart: '#00B4AB',
  'Jupyter Notebook': '#DA5B0B',
};

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

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TrendingPage() {
  const t = useTranslations('Trending');
  const locale = useLocale();

  const [repos, setRepos] = useState<TrendingRepo[]>([]);
  const [weeks, setWeeks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch available weeks
  useEffect(() => {
    fetch('/api/trpc/trending.weeks?batch=1')
      .then((r) => r.json())
      .then((data) => {
        const weekList: string[] = data[0]?.result?.data?.json ?? [];
        setWeeks(weekList);
      })
      .catch(() => {});
  }, []);

  // Fetch repos for selected week
  const loadRepos = useCallback(
    async (weekOf?: string) => {
      setLoading(true);
      setError('');
      try {
        const input = weekOf ? { weekOf } : {};
        const res = await fetch(
          '/api/trpc/trending.list?batch=1&input=' +
            encodeURIComponent(JSON.stringify({ '0': { json: input } })),
        );
        const data = await res.json();
        const result = data[0]?.result?.data?.json;
        setRepos(result?.repos ?? []);
        if (result?.weekOf && !selectedWeek) {
          setSelectedWeek(result.weekOf);
        }
      } catch {
        setError('Failed to load trending data');
      } finally {
        setLoading(false);
      }
    },
    [selectedWeek],
  );

  useEffect(() => {
    loadRepos(selectedWeek ?? undefined);
  }, [selectedWeek, loadRepos]);

  return (
    <div className="border-t border-b border-compat-soft bg-[var(--portal-color-surface)]">
      <div className="pt-8 md:pt-24 pb-12 md:pb-20 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        {/* Section Header */}
        <div className="flex items-baseline" style={{ gap: '.8rem', marginBottom: '1.5rem' }}>
          <span
            style={{
              width: 28,
              height: 2,
              background: 'var(--portal-color-primary)',
              flexShrink: 0,
            }}
          />
          <span
            className="font-mono uppercase text-[var(--portal-color-primary)]"
            style={{ fontSize: '.7rem', fontWeight: 500, letterSpacing: '.1em' }}
          >
            {t('sectionLabel')}
          </span>
          <h1
            className="text-[var(--portal-color-text)]"
            style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.03em' }}
          >
            {t('title')}
          </h1>
        </div>

        {/* Subtitle + Week Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <p className="text-sm text-[var(--portal-color-text-secondary)] max-w-lg">
            {t('subtitle')}
          </p>
          {weeks.length > 0 && (
            <select
              value={selectedWeek ?? ''}
              onChange={(e) => setSelectedWeek(e.target.value || null)}
              className="text-sm px-3 py-1.5 rounded-lg border border-compat bg-[var(--portal-color-background)] text-[var(--portal-color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--portal-color-primary)]/30 cursor-pointer"
            >
              {weeks.map((w) => (
                <option key={w} value={w}>
                  {t('weekOf')} {formatDate(w, locale)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-compat-soft bg-[var(--portal-color-background)] p-5 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="flex gap-2">
                  <div className="h-5 w-14 bg-gray-200 dark:bg-gray-800 rounded-full" />
                  <div className="h-5 w-14 bg-gray-200 dark:bg-gray-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-500/10 p-6 text-center text-sm text-red-500">
            {error}
          </div>
        ) : repos.length === 0 ? (
          <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] p-16 text-center">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-[var(--portal-color-text-secondary)] font-medium">{t('noData')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repos.map((repo, index) => {
              const summary = locale === 'zh' ? repo.summaryZh : repo.summaryEn;
              const langColor = repo.language
                ? LANG_COLORS[repo.language] ?? '#8b8b8b'
                : undefined;

              return (
                <div
                  key={repo.id}
                  className="group relative rounded-xl border border-compat-soft bg-[var(--portal-color-background)] p-5 transition-all duration-200 hover:border-[var(--portal-color-primary)]/40 hover:shadow-lg"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Header: Repo name + stars */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* GitHub icon */}
                      <svg
                        className="h-5 w-5 shrink-0 text-[var(--portal-color-text-secondary)]"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                      </svg>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--portal-color-text)] font-semibold text-[0.95rem] truncate hover:text-[var(--portal-color-primary)] transition-colors no-underline"
                      >
                        {repo.fullName}
                      </a>
                    </div>

                    {/* Star badge */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-compat bg-transparent text-[var(--portal-color-text-secondary)] text-xs font-semibold"
                      >
                        <svg
                          className="h-3.5 w-3.5 text-amber-500"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                        </svg>
                        <span>{formatNumber(repo.stars)}</span>
                      </div>
                      {repo.starsGrowth > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 whitespace-nowrap">
                          +{formatNumber(repo.starsGrowth)} {t('starsThisWeek') || 'this week'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content: Display AI Summary if present; fallback to original Description */}
                  {summary ? (
                    <div className="mb-3 rounded-lg bg-[var(--portal-color-primary)]/5 border border-[var(--portal-color-primary)]/10 px-3 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs">✨</span>
                        <span className="text-xs font-semibold text-[var(--portal-color-primary)]">
                          {t('summary')}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--portal-color-text)] leading-relaxed whitespace-pre-line">
                        {summary}
                      </p>
                    </div>
                  ) : (
                    repo.description && (
                      <p className="text-sm text-[var(--portal-color-text-secondary)] mb-3 line-clamp-2 leading-relaxed">
                        {repo.description}
                      </p>
                    )
                  )}

                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--portal-color-text-secondary)]">
                    {/* Language */}
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: langColor }}
                        />
                        {repo.language}
                      </span>
                    )}

                    {/* Forks */}
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                      </svg>
                      {formatNumber(repo.forks)}
                    </span>

                    {/* Created at */}
                    <span>{formatDate(repo.repoCreatedAt, locale)}</span>
                  </div>

                  {/* Topics */}
                  {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {repo.topics.slice(0, 5).map((topic) => (
                        <span
                          key={topic}
                          className="inline-block rounded-full bg-[var(--portal-color-primary)]/10 px-2.5 py-0.5 text-[0.68rem] font-medium text-[var(--portal-color-primary)]"
                        >
                          {topic}
                        </span>
                      ))}
                      {repo.topics.length > 5 && (
                        <span className="text-xs text-[var(--portal-color-text-secondary)] self-center">
                          +{repo.topics.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
