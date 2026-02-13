'use client';

import { useState, useEffect } from 'react';
import siteConfig from '@/site.config';

interface GuestbookEntry {
    id: string;
    authorName: string;
    content: string;
    avatar: string | null;
    createdAt: string;
}

interface GuestbookData {
    result: {
        data: {
            json: {
                entries: GuestbookEntry[];
                pagination: { page: number; totalPages: number; total: number };
            };
        };
    };
}

export default function GuestbookPage() {
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchEntries = async () => {
        try {
            const res = await fetch('/api/trpc/guestbook.list?input={}');
            const data: GuestbookData = await res.json();
            setEntries(data.result.data.json.entries);
            setTotal(data.result.data.json.pagination.total);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !content.trim()) return;
        setSubmitting(true);
        try {
            await fetch('/api/trpc/guestbook.create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    json: { authorName: name.trim(), content: content.trim() },
                }),
            });
            setName('');
            setContent('');
            await fetchEntries();
        } catch {
            // silently fail
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <h1 className="mb-2 text-3xl font-bold text-[var(--portal-color-text)]">Guestbook</h1>
            <p className="mb-8 text-[var(--portal-color-text-secondary)]">
                Leave a message — say hi, share a thought, or just wave 👋
            </p>

            {/* Submit Form */}
            <form
                onSubmit={handleSubmit}
                className="mb-10 space-y-4 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6"
            >
                <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] px-4 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                />
                <textarea
                    placeholder="Write a message…"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={3}
                    maxLength={500}
                    className="w-full resize-none rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] px-4 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                />
                <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--portal-color-text-secondary)]">
                        {content.length}/500
                    </span>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-[var(--portal-color-primary)] px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {submitting ? 'Sending…' : 'Send ✉️'}
                    </button>
                </div>
            </form>

            {/* Entries */}
            <h2 className="mb-4 text-lg font-semibold text-[var(--portal-color-text)]">
                Messages ({total})
            </h2>

            {loading ? (
                <p className="py-8 text-center text-sm text-[var(--portal-color-text-secondary)]">Loading…</p>
            ) : entries.length > 0 ? (
                <div className="space-y-4">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-4"
                        >
                            <div className="mb-2 flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--portal-color-accent)] text-sm font-bold text-white">
                                    {entry.authorName[0]?.toUpperCase()}
                                </span>
                                <span className="font-medium text-[var(--portal-color-text)]">
                                    {entry.authorName}
                                </span>
                                <time className="text-xs text-[var(--portal-color-text-secondary)]">
                                    {new Date(entry.createdAt).toLocaleDateString('zh-CN')}
                                </time>
                            </div>
                            <p className="text-sm leading-relaxed text-[var(--portal-color-text)]">
                                {entry.content}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="py-8 text-center text-sm text-[var(--portal-color-text-secondary)]">
                    No messages yet. Be the first! 🎉
                </p>
            )}
        </div>
    );
}
