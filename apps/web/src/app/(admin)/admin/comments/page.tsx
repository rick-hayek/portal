'use client';

import { useEffect, useState, useCallback } from 'react';

interface Comment {
    id: string;
    authorName: string;
    authorEmail: string | null;
    content: string;
    status: string;
    createdAt: string;
    post: { title: string; slug: string };
}

export default function CommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    const loadComments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/trpc/admin.recentComments?batch=1&input=${encodeURIComponent(JSON.stringify({ '0': { json: { limit: 50 } } }))}`,
            );
            const data = await res.json();
            setComments(data[0]?.result?.data?.json ?? []);
        } catch (e) {
            console.error('Failed to load comments', e);
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadComments(); }, [loadComments]);

    async function handleModerate(id: string, status: 'approved' | 'spam' | 'pending') {
        try {
            await fetch('/api/trpc/admin.commentModerate?batch=1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ '0': { json: { id, status } } }),
            });
            loadComments();
        } catch (e) {
            console.error('Moderation failed', e);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this comment?')) return;
        try {
            await fetch('/api/trpc/admin.commentDelete?batch=1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ '0': { json: { id } } }),
            });
            loadComments();
        } catch (e) {
            console.error('Delete failed', e);
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">Comment Moderation</h1>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]" />
                    ))
                ) : comments.length === 0 ? (
                    <p className="py-8 text-center text-[var(--portal-color-text-secondary)]">No comments found.</p>
                ) : (
                    comments.map((c) => (
                        <div key={c.id} className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-[var(--portal-color-text)]">{c.authorName}</span>
                                        {c.authorEmail && (
                                            <span className="text-[var(--portal-color-text-secondary)]">({c.authorEmail})</span>
                                        )}
                                        <span className={`rounded-full px-2 py-0.5 text-xs ${c.status === 'approved'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                : c.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-[var(--portal-color-text)]">{c.content}</p>
                                    <p className="mt-1 text-xs text-[var(--portal-color-text-secondary)]">
                                        on <em>{c.post.title}</em> · {new Date(c.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-1.5">
                                    {c.status !== 'approved' && (
                                        <button
                                            onClick={() => handleModerate(c.id, 'approved')}
                                            className="rounded-md border border-green-300 px-2 py-1 text-xs text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {c.status !== 'spam' && (
                                        <button
                                            onClick={() => handleModerate(c.id, 'spam')}
                                            className="rounded-md border border-yellow-300 px-2 py-1 text-xs text-yellow-600 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                                        >
                                            Spam
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
