'use client';

import { useEffect, useState } from 'react';

interface Stats {
    totalPosts: number;
    publishedPosts: number;
    totalComments: number;
    pendingComments: number;
    totalGuestbook: number;
    totalViews: number;
}

interface RecentComment {
    id: string;
    authorName: string;
    content: string;
    status: string;
    createdAt: string;
    post: { title: string; slug: string };
}

interface GuestbookEntry {
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
    return (
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
            <p className="text-sm text-[var(--portal-color-text-secondary)]">{label}</p>
            <p className={`mt-1 text-3xl font-bold ${accent ? 'text-[var(--portal-color-primary)]' : 'text-[var(--portal-color-text)]'}`}>
                {value.toLocaleString()}
            </p>
        </div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [comments, setComments] = useState<RecentComment[]>([]);
    const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [statsRes, commentsRes, guestbookRes] = await Promise.all([
                    fetch('/api/trpc/admin.stats?batch=1&input=' + encodeURIComponent(JSON.stringify({ '0': { json: null } }))),
                    fetch('/api/trpc/admin.recentComments?batch=1&input=' + encodeURIComponent(JSON.stringify({ '0': { json: {} } }))),
                    fetch('/api/trpc/admin.recentGuestbook?batch=1&input=' + encodeURIComponent(JSON.stringify({ '0': { json: {} } }))),
                ]);
                const [statsData, commentsData, guestbookData] = await Promise.all([
                    statsRes.json(), commentsRes.json(), guestbookRes.json(),
                ]);
                setStats(statsData[0]?.result?.data?.json);
                setComments(commentsData[0]?.result?.data?.json ?? []);
                setGuestbook(guestbookData[0]?.result?.data?.json ?? []);
            } catch (e) {
                console.error('Failed to load dashboard data', e);
            }
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">Dashboard</h1>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">Dashboard</h1>

            {/* Stats Grid */}
            {stats && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total Posts" value={stats.totalPosts} accent />
                    <StatCard label="Published" value={stats.publishedPosts} />
                    <StatCard label="Comments" value={stats.totalComments} />
                    <StatCard label="Pending Comments" value={stats.pendingComments} />
                    <StatCard label="Guestbook Entries" value={stats.totalGuestbook} />
                    <StatCard label="Page Views" value={stats.totalViews} />
                </div>
            )}

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Comments */}
                <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
                    <h2 className="mb-3 text-lg font-semibold text-[var(--portal-color-text)]">Recent Comments</h2>
                    {comments.length === 0 ? (
                        <p className="text-sm text-[var(--portal-color-text-secondary)]">No comments yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {comments.map((c) => (
                                <li key={c.id} className="border-b border-[var(--portal-color-border)] pb-2 last:border-0">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-[var(--portal-color-text)]">{c.authorName}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-xs ${c.status === 'approved'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                : c.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 line-clamp-2 text-sm text-[var(--portal-color-text-secondary)]">{c.content}</p>
                                    <p className="mt-0.5 text-xs text-[var(--portal-color-text-secondary)]">
                                        on <em>{c.post.title}</em> · {new Date(c.createdAt).toLocaleDateString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Recent Guestbook */}
                <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
                    <h2 className="mb-3 text-lg font-semibold text-[var(--portal-color-text)]">Recent Guestbook</h2>
                    {guestbook.length === 0 ? (
                        <p className="text-sm text-[var(--portal-color-text-secondary)]">No entries yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {guestbook.map((g) => (
                                <li key={g.id} className="border-b border-[var(--portal-color-border)] pb-2 last:border-0">
                                    <span className="text-sm font-medium text-[var(--portal-color-text)]">{g.authorName}</span>
                                    <p className="mt-0.5 line-clamp-2 text-sm text-[var(--portal-color-text-secondary)]">{g.content}</p>
                                    <p className="mt-0.5 text-xs text-[var(--portal-color-text-secondary)]">
                                        {new Date(g.createdAt).toLocaleDateString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
