'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [liveUrl, setLiveUrl] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const [techStack, setTechStack] = useState('');
    const [featured, setFeatured] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setSlug(title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, ''));
    }, [title]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const res = await fetch('/api/trpc/admin.projectCreate?batch=1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    '0': {
                        json: {
                            title,
                            slug,
                            description,
                            coverImage: coverImage || undefined,
                            liveUrl: liveUrl || undefined,
                            repoUrl: repoUrl || undefined,
                            techStack: techStack.split(',').map(s => s.trim()).filter(Boolean),
                            featured,
                        },
                    },
                }),
            });
            const data = await res.json();
            if (data[0]?.error) {
                setError(data[0].error.message ?? 'Failed to create project');
            } else {
                router.push('/admin/portfolio');
            }
        } catch {
            setError('Network error');
        }
        setSaving(false);
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">New Project</h1>

            <form onSubmit={handleSave} className="space-y-5">
                {error && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
                )}

                <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                        className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none" />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">Slug</label>
                    <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required
                        className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 font-mono text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none" />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={5}
                        className="w-full resize-y rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">Cover Image URL</label>
                        <input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)}
                            className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                            placeholder="https://..." />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">Tech Stack</label>
                        <input type="text" value={techStack} onChange={e => setTechStack(e.target.value)}
                            className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                            placeholder="React, TypeScript, Prisma" />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">Live URL</label>
                        <input type="text" value={liveUrl} onChange={e => setLiveUrl(e.target.value)}
                            className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">Repo URL</label>
                        <input type="text" value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
                            className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none" />
                    </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-[var(--portal-color-text)]">
                    <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)}
                        className="h-4 w-4 rounded border-[var(--portal-color-border)]" />
                    Featured project
                </label>

                <div className="flex gap-3">
                    <button type="submit" disabled={saving}
                        className="rounded-lg bg-[var(--portal-color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
                        {saving ? 'Saving…' : 'Create Project'}
                    </button>
                    <button type="button" onClick={() => router.back()}
                        className="rounded-lg border border-[var(--portal-color-border)] px-5 py-2.5 text-sm text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)]">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
