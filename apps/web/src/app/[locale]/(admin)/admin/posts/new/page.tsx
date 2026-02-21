'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';

interface Category {
    id: string;
    name: string;
}

export default function NewPostPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [categories, setCategories] = useState<Category[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Auto-generate slug from title
    useEffect(() => {
        setSlug(
            title
                .toLowerCase()
                .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
                .replace(/^-|-$/g, ''),
        );
    }, [title]);

    // Load categories
    useEffect(() => {
        fetch('/api/trpc/category.list?batch=1&input=' + encodeURIComponent(JSON.stringify({ '0': { json: null } })))
            .then((r) => r.json())
            .then((data) => setCategories(data[0]?.result?.data?.json ?? []))
            .catch(() => { });
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const res = await fetch('/api/trpc/admin.postCreate?batch=1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    '0': {
                        json: {
                            title,
                            slug,
                            content,
                            excerpt: excerpt || undefined,
                            status,
                            categoryId: categoryId || undefined,
                        },
                    },
                }),
            });
            const data = await res.json();
            if (data[0]?.error) {
                setError(data[0].error.message ?? 'Failed to create post');
            } else {
                router.push('/admin/posts');
            }
        } catch {
            setError('Network error');
        }
        setSaving(false);
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">New Post</h1>

            <form onSubmit={handleSave} className="space-y-5">
                {error && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </p>
                )}

                {/* Title */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                        placeholder="Post title"
                    />
                </div>

                {/* Slug */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">Slug</label>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        required
                        className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none font-mono"
                    />
                </div>

                {/* Category + Status */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">Category</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)]"
                        >
                            <option value="">No category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                            className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)]"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                </div>

                {/* Excerpt */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">Excerpt</label>
                    <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        rows={2}
                        className="w-full resize-none rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                        placeholder="Brief summary (optional)"
                    />
                </div>

                {/* Content (Markdown Editor) */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">Content (Markdown)</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={20}
                        className="w-full resize-y rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-4 py-3 font-mono text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                        placeholder="Write your article in Markdown…"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-[var(--portal-color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : status === 'published' ? 'Publish' : 'Save Draft'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-lg border border-[var(--portal-color-border)] px-5 py-2.5 text-sm text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)]"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
