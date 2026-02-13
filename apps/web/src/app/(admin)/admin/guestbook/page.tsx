'use client';

import { useEffect, useState, useCallback } from 'react';

interface GuestbookEntry {
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
}

export default function GuestbookAdminPage() {
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const loadEntries = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/trpc/admin.recentGuestbook?batch=1&input=${encodeURIComponent(JSON.stringify({ '0': { json: { limit: 50 } } }))}`,
            );
            const data = await res.json();
            setEntries(data[0]?.result?.data?.json ?? []);
        } catch (e) {
            console.error('Failed to load guestbook', e);
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadEntries(); }, [loadEntries]);

    async function handleDelete(id: string) {
        if (!confirm('Delete this entry?')) return;
        try {
            await fetch('/api/trpc/admin.guestbookDelete?batch=1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ '0': { json: { id } } }),
            });
            loadEntries();
        } catch (e) {
            console.error('Delete failed', e);
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">Guestbook Management</h1>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-20 animate-pulse rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]" />
                    ))
                ) : entries.length === 0 ? (
                    <p className="py-8 text-center text-[var(--portal-color-text-secondary)]">No guestbook entries.</p>
                ) : (
                    entries.map((e) => (
                        <div key={e.id} className="flex items-start justify-between rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-4">
                            <div>
                                <span className="text-sm font-medium text-[var(--portal-color-text)]">{e.authorName}</span>
                                <p className="mt-0.5 text-sm text-[var(--portal-color-text-secondary)]">{e.content}</p>
                                <p className="mt-0.5 text-xs text-[var(--portal-color-text-secondary)]">
                                    {new Date(e.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(e.id)}
                                className="shrink-0 rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
