'use client';

import { Archive, CheckCircle2, Database, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown';

interface AnalyticsData {
  totalViews: number;
  recentViews: number;
  days: number;
  topPages: { path: string; views: number }[];
  viewsByDay: { date: string; views: number }[];
  keyPageViews?: Record<string, number>;
  archivedSummary?: {
    total: number;
    lastCleanedAt?: string;
    paths: Record<string, number>;
  };
}

const KEY_PAGES_META = [
  { path: '/', key: 'home' },
  { path: '/blog', key: 'blog' },
  { path: '/links', key: 'links' },
  { path: '/portfolio', key: 'portfolio' },
  { path: '/trending', key: 'trending' },
  { path: '/books', key: 'books' },
  { path: '/tools', key: 'tools' },
  { path: '/about', key: 'about' },
] as const;

export default function AdminAnalyticsPage() {
  const t = useTranslations('Admin.analytics');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  // Cleanup card state
  const [cleanupDays, setCleanupDays] = useState(90);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{ count: number } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const analyticsDaysOptions: DropdownOption<number>[] = [
    { value: 7, label: t('last7Days') },
    { value: 30, label: t('last30Days') },
    { value: 90, label: t('last90Days') },
  ];

  const cleanupDaysOptions: DropdownOption<number>[] = [
    { value: 30, label: t('keep30Days') },
    { value: 90, label: t('keep90Days') },
    { value: 180, label: t('keep180Days') },
  ];

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(
      '/api/trpc/analytics.summary?batch=1&input=' +
        encodeURIComponent(
          JSON.stringify({
            '0': { json: { days } },
          }),
        ),
    )
      .then((r) => r.json())
      .then((json) => setData(json[0]?.result?.data?.json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExecuteCleanup = async () => {
    setIsCleaning(true);
    setShowConfirmModal(false);
    try {
      const res = await fetch('/api/trpc/analytics.cleanup?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': { json: { daysToKeep: cleanupDays } },
        }),
      });
      const json = await res.json();
      const result = json[0]?.result?.data?.json;
      if (result?.success) {
        setCleanupResult({ count: result.deletedCount || 0 });
        fetchData();
      }
    } catch (err) {
      console.error('[Analytics] Cleanup error:', err);
    } finally {
      setIsCleaning(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">{t('title')}</h1>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items do not have a natural id
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]"
            />
          ))}
        </div>
      </div>
    );
  }

  const maxViews = Math.max(1, ...data.viewsByDay.map((d) => d.views));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">{t('title')}</h1>
        <div className="w-36">
          <Dropdown
            value={days}
            onChange={(val) => setDays(val)}
            options={analyticsDaysOptions}
            align="right"
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
          <p className="text-sm text-[var(--portal-color-text-secondary)]">{t('totalViews')}</p>
          <p className="mt-1 text-3xl font-bold text-[var(--portal-color-text)]">
            {data.totalViews.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
          <p className="text-sm text-[var(--portal-color-text-secondary)]">{t('recentViews')}</p>
          <p className="mt-1 text-3xl font-bold text-[var(--portal-color-text)]">
            {data.recentViews.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
          <p className="text-sm text-[var(--portal-color-text-secondary)]">{t('avgDaily')}</p>
          <p className="mt-1 text-3xl font-bold text-[var(--portal-color-text)]">
            {data.days > 0 ? Math.round(data.recentViews / data.days) : 0}
          </p>
        </div>
      </div>

      {/* Key module pages all-time views */}
      {data.keyPageViews && (
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--portal-color-text-secondary)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--portal-color-primary)]" />
            {t('keyPagesTitle')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {KEY_PAGES_META.map((item) => {
              const count = data.keyPageViews?.[item.path] ?? 0;
              return (
                <div
                  key={item.path}
                  className="rounded-lg border border-[var(--portal-color-border-soft)] bg-[rgba(107,142,201,0.03)] p-3"
                >
                  <p className="text-xs font-mono text-[var(--portal-color-text-secondary)] truncate">
                    {item.path} ({t(`pages.${item.key}`)})
                  </p>
                  <p className="mt-1 text-lg font-bold text-[var(--portal-color-text)]">
                    {count.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily trend bar chart */}
      <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--portal-color-text-secondary)]">
          {t('dailyTrend')}
        </h2>
        {data.viewsByDay.length === 0 ? (
          <p className="py-8 text-center text-[var(--portal-color-text-secondary)]">
            {t('noData')}
          </p>
        ) : (
          <div
            className="w-full overflow-x-auto pb-2 scrollbar-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div
              className="flex items-end gap-0.5 md:gap-1 min-w-[400px] md:min-w-0"
              style={{ height: 160 }}
            >
              {data.viewsByDay.map((d) => (
                <div key={d.date} className="group relative flex-1" style={{ height: '100%' }}>
                  <div
                    className="absolute bottom-0 w-full rounded-t bg-[var(--portal-color-primary)] transition-all group-hover:opacity-80"
                    style={{
                      height: `${(d.views / maxViews) * 100}%`,
                      minHeight: d.views > 0 ? 4 : 0,
                    }}
                  />
                  <div className="absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[var(--portal-color-text)] px-1.5 py-0.5 text-xs text-[var(--portal-color-background)] group-hover:block">
                    {d.views} views
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top pages */}
      <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--portal-color-text-secondary)]">
          {t('topPages')}
        </h2>
        {data.topPages.length === 0 ? (
          <p className="text-center text-[var(--portal-color-text-secondary)]">{t('noData')}</p>
        ) : (
          <div className="space-y-2">
            {data.topPages.map((p, i) => (
              <div key={p.path} className="flex items-center gap-3">
                <span className="w-6 text-right text-sm font-medium text-[var(--portal-color-text-secondary)]">
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-sm text-[var(--portal-color-text)]">
                  {p.path}
                </span>
                <span className="shrink-0 text-sm font-medium text-[var(--portal-color-text)]">
                  {p.views}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Lifecycle & Safe Archival Management Card */}
      <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[var(--portal-color-primary)]" />
          <h2 className="text-base font-semibold text-[var(--portal-color-text)]">
            {t('cleanupTitle')}
          </h2>
        </div>

        <p className="text-xs leading-relaxed text-[var(--portal-color-text-secondary)]">
          {t('cleanupDesc')}
        </p>

        {cleanupResult && (
          <div className="flex items-center gap-2 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {t('cleanupSuccess')}{' '}
              {t('cleanupDeleted', { count: cleanupResult.count })}
            </span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-[var(--portal-color-border-soft)]">
          <div className="space-y-1">
            <p className="text-xs text-[var(--portal-color-text-secondary)]">
              {t('archivedBaseCount')}
            </p>
            <p className="text-lg font-bold text-[var(--portal-color-text)]">
              {(data.archivedSummary?.total ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[var(--portal-color-text-secondary)]">
              {t('lastArchivedAt')}
            </p>
            <p className="text-sm font-medium text-[var(--portal-color-text)]">
              {data.archivedSummary?.lastCleanedAt
                ? new Date(data.archivedSummary.lastCleanedAt).toLocaleString()
                : t('neverArchived')}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
          <div className="w-full sm:w-64">
            <Dropdown
              value={cleanupDays}
              onChange={(val) => setCleanupDays(val)}
              options={cleanupDaysOptions}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={isCleaning}
            className="flex items-center justify-center gap-2 rounded-lg bg-[var(--portal-color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isCleaning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('cleaning')}</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                <span>{t('triggerCleanup')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-500">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-[var(--portal-color-text)]">
                {t('confirmCleanupTitle')}
              </h3>
            </div>
            <p className="text-sm text-[var(--portal-color-text-secondary)] leading-relaxed">
              {t('confirmCleanupDesc')}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg border border-[var(--portal-color-border)] px-4 py-2 text-sm font-medium text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface)] transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleExecuteCleanup}
                className="rounded-lg bg-[var(--portal-color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                {t('confirmExecute')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
