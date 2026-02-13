'use client';

import { useEffect, useState } from 'react';

interface AnalyticsData {
    totalViews: number;
    recentViews: number;
    days: number;
    topPages: { path: string; views: number }[];
    viewsByDay: { date: string; views: number }[];
}

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('/api/trpc/analytics.summary?batch=1&input=' + encodeURIComponent(JSON.stringify({
            '0': { json: { days } },
        })))
            .then(r => r.json())
            .then(json => setData(json[0]?.result?.data?.json))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [days]);

    if (loading || !data) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">Analytics</h1>
                <div className="grid gap-4 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]" />
                    ))}
                </div>
            </div>
        );
    }

    const maxViews = Math.max(1, ...data.viewsByDay.map(d => d.views));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">Analytics</h1>
                <select
                    value={days}
                    onChange={e => setDays(Number(e.target.value))}
                    className="rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-1.5 text-sm text-[var(--portal-color-text)] focus:outline-none"
                >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                </select>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
                    <p className="text-sm text-[var(--portal-color-text-secondary)]">Total Page Views</p>
                    <p className="mt-1 text-3xl font-bold text-[var(--portal-color-text)]">{data.totalViews.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
                    <p className="text-sm text-[var(--portal-color-text-secondary)]">Last {data.days} Days</p>
                    <p className="mt-1 text-3xl font-bold text-[var(--portal-color-text)]">{data.recentViews.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
                    <p className="text-sm text-[var(--portal-color-text-secondary)]">Avg. / Day</p>
                    <p className="mt-1 text-3xl font-bold text-[var(--portal-color-text)]">{data.days > 0 ? Math.round(data.recentViews / data.days) : 0}</p>
                </div>
            </div>

            {/* Daily trend bar chart */}
            <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--portal-color-text-secondary)]">Daily Views</h2>
                {data.viewsByDay.length === 0 ? (
                    <p className="py-8 text-center text-[var(--portal-color-text-secondary)]">No data in range</p>
                ) : (
                    <div className="flex items-end gap-1" style={{ height: 160 }}>
                        {data.viewsByDay.map((d) => (
                            <div key={d.date} className="group relative flex-1" style={{ height: '100%' }}>
                                <div
                                    className="absolute bottom-0 w-full rounded-t bg-[var(--portal-color-primary)] transition-all group-hover:opacity-80"
                                    style={{ height: `${(d.views / maxViews) * 100}%`, minHeight: d.views > 0 ? 4 : 0 }}
                                />
                                <div className="absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[var(--portal-color-text)] px-1.5 py-0.5 text-xs text-[var(--portal-color-background)] group-hover:block">
                                    {d.views} views
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Top pages */}
            <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--portal-color-text-secondary)]">Top Pages</h2>
                {data.topPages.length === 0 ? (
                    <p className="text-center text-[var(--portal-color-text-secondary)]">No data</p>
                ) : (
                    <div className="space-y-2">
                        {data.topPages.map((p, i) => (
                            <div key={p.path} className="flex items-center gap-3">
                                <span className="w-6 text-right text-sm font-medium text-[var(--portal-color-text-secondary)]">{i + 1}</span>
                                <span className="flex-1 truncate text-sm text-[var(--portal-color-text)]">{p.path}</span>
                                <span className="shrink-0 text-sm font-medium text-[var(--portal-color-text)]">{p.views}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
