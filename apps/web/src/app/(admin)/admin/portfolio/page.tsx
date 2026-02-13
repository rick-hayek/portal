'use client';

import { useEffect, useState, useCallback } from 'react';

interface Project {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string | null;
    liveUrl: string | null;
    repoUrl: string | null;
    techStack: string[];
    sortOrder: number;
    featured: boolean;
}

export default function AdminPortfolioPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const loadProjects = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(
                '/api/trpc/admin.projectList?batch=1&input=' + encodeURIComponent(JSON.stringify({ '0': { json: null } })),
            );
            const data = await res.json();
            setProjects(data[0]?.result?.data?.json ?? []);
        } catch (e) {
            console.error('Failed to load projects', e);
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadProjects(); }, [loadProjects]);

    async function handleDelete(id: string) {
        if (!confirm('Delete this project?')) return;
        await fetch('/api/trpc/admin.projectDelete?batch=1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ '0': { json: { id } } }),
        });
        loadProjects();
    }

    async function toggleFeatured(id: string, featured: boolean) {
        await fetch('/api/trpc/admin.projectUpdate?batch=1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ '0': { json: { id, featured: !featured } } }),
        });
        loadProjects();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">Portfolio</h1>
                <a
                    href="/admin/portfolio/new"
                    className="rounded-lg bg-[var(--portal-color-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                    + New Project
                </a>
            </div>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-20 animate-pulse rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]" />
                    ))
                ) : projects.length === 0 ? (
                    <p className="py-8 text-center text-[var(--portal-color-text-secondary)]">No projects yet.</p>
                ) : (
                    projects.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-[var(--portal-color-text)]">{p.title}</span>
                                    {p.featured && (
                                        <span className="rounded-full bg-[var(--portal-color-primary)]/10 px-2 py-0.5 text-xs text-[var(--portal-color-primary)]">
                                            Featured
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {p.techStack.map((t) => (
                                        <span key={t} className="rounded bg-[var(--portal-color-background)] px-1.5 py-0.5 text-xs text-[var(--portal-color-text-secondary)]">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex shrink-0 gap-2">
                                <button
                                    onClick={() => toggleFeatured(p.id, p.featured)}
                                    className="text-xs text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-primary)]"
                                >
                                    {p.featured ? '★' : '☆'}
                                </button>
                                <a href={`/portfolio/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--portal-color-text-secondary)] hover:underline">
                                    View
                                </a>
                                <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:underline">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
