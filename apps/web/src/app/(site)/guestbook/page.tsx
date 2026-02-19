'use client';

import { useState, useEffect } from 'react';

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
        <div style={{ padding: '5rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            {/* Section header */}
            <div className="flex items-baseline" style={{ gap: '.8rem', marginBottom: '2.5rem' }}>
                <span style={{ width: 28, height: 2, background: 'var(--portal-color-primary)', flexShrink: 0 }}></span>
                <span className="font-mono uppercase text-[var(--portal-color-primary)]"
                    style={{ fontSize: '.7rem', fontWeight: 500, letterSpacing: '.1em' }}
                >Community</span>
                <h1 className="text-[var(--portal-color-text)]"
                    style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.03em' }}
                >Guestbook</h1>
            </div>

            {/* Submit Form */}
            <form
                onSubmit={handleSubmit}
                className="border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]"
                style={{ padding: '1.5rem', borderRadius: 12, marginBottom: '2.5rem' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
                    <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={100}
                        className="border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                        style={{ padding: '.6rem 1rem', borderRadius: 8, fontSize: '.85rem', width: '100%' }}
                    />
                    <textarea
                        placeholder="Write a message…"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={3}
                        maxLength={500}
                        className="resize-none border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                        style={{ padding: '.6rem 1rem', borderRadius: 8, fontSize: '.85rem', width: '100%' }}
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-[var(--portal-color-text-secondary)]" style={{ fontSize: '.72rem' }}>
                            {content.length}/500
                        </span>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: 'var(--portal-color-primary)', borderRadius: 100, padding: '.4rem 1.2rem', fontSize: '.82rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                        >
                            {submitting ? 'Sending…' : 'Send ✉️'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Entries */}
            {loading ? (
                <p className="py-8 text-center text-[var(--portal-color-text-secondary)]" style={{ fontSize: '.82rem' }}>Loading…</p>
            ) : entries.length > 0 ? (
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] transition-all hover:border-[var(--portal-color-primary)]"
                            style={{ padding: '1.2rem', borderRadius: 12, boxShadow: 'none' }}
                            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.06)')}
                            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                        >
                            <div className="flex items-center" style={{ gap: '.6rem', marginBottom: '.5rem' }}>
                                <span className="flex items-center justify-center rounded-full bg-[var(--portal-color-primary)]/10 text-[var(--portal-color-primary)]"
                                    style={{ width: 28, height: 28, fontSize: '.65rem', fontWeight: 700 }}
                                >
                                    {entry.authorName.slice(0, 2).toUpperCase()}
                                </span>
                                <span className="text-[var(--portal-color-text)]"
                                    style={{ fontSize: '.78rem', fontWeight: 600 }}
                                >{entry.authorName}</span>
                                <time className="ml-auto font-mono text-[var(--portal-color-text-secondary)]"
                                    style={{ fontSize: '.6rem' }}
                                >
                                    {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </time>
                            </div>
                            <p className="text-[var(--portal-color-text-secondary)]"
                                style={{ fontSize: '.82rem', lineHeight: 1.6 }}
                            >{entry.content}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="py-8 text-center text-[var(--portal-color-text-secondary)]" style={{ fontSize: '.82rem' }}>
                    No messages yet. Be the first! 🎉
                </p>
            )}

            {/* Stats Row */}
            <div className="flex border-t border-[var(--portal-color-border-soft)]" style={{ gap: '3rem', padding: '2rem 0', marginTop: '2rem' }}>
                <div className="text-center">
                    <div className="text-[var(--portal-color-text)]" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-.04em' }}>42</div>
                    <div className="uppercase text-[var(--portal-color-text-secondary)]" style={{ fontSize: '.72rem', fontWeight: 500, letterSpacing: '.04em', marginTop: '.2rem' }}>Posts</div>
                </div>
                <div className="text-center">
                    <div className="text-[var(--portal-color-text)]" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-.04em' }}>12</div>
                    <div className="uppercase text-[var(--portal-color-text-secondary)]" style={{ fontSize: '.72rem', fontWeight: 500, letterSpacing: '.04em', marginTop: '.2rem' }}>Projects</div>
                </div>
                <div className="text-center">
                    <div className="text-[var(--portal-color-text)]" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-.04em' }}>3.2K</div>
                    <div className="uppercase text-[var(--portal-color-text-secondary)]" style={{ fontSize: '.72rem', fontWeight: 500, letterSpacing: '.04em', marginTop: '.2rem' }}>Page Views</div>
                </div>
                <div className="text-center">
                    <div className="text-[var(--portal-color-text)]" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-.04em' }}>{total || 86}</div>
                    <div className="uppercase text-[var(--portal-color-text-secondary)]" style={{ fontSize: '.72rem', fontWeight: 500, letterSpacing: '.04em', marginTop: '.2rem' }}>Guestbook</div>
                </div>
            </div>
        </div>
    );
}
