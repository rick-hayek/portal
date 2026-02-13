'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Project {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string | null;
    liveUrl: string | null;
    repoUrl: string | null;
    techStack: string[];
    featured: boolean;
    createdAt: string;
}

export default function ProjectDetailPage() {
    const params = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/trpc/portfolio.bySlug?batch=1&input=' + encodeURIComponent(JSON.stringify({
            '0': { json: { slug: params.slug } }
        })))
            .then(r => r.json())
            .then(data => setProject(data[0]?.result?.data?.json))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [params.slug]);

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-10">
                <div className="h-8 w-64 animate-pulse rounded bg-[var(--portal-color-border)]" />
                <div className="mt-4 aspect-video animate-pulse rounded-xl bg-[var(--portal-color-border)]" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">Project not found</h1>
                <a href="/portfolio" className="mt-4 inline-block text-[var(--portal-color-primary)] hover:underline">
                    ← Back to Portfolio
                </a>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            {/* Breadcrumb */}
            <a href="/portfolio" className="text-sm text-[var(--portal-color-primary)] hover:underline">
                ← Portfolio
            </a>

            <h1 className="mt-4 text-3xl font-bold text-[var(--portal-color-text)]">{project.title}</h1>

            {/* Cover */}
            {project.coverImage && (
                <img
                    src={project.coverImage}
                    alt={project.title}
                    className="mt-6 w-full rounded-xl border border-[var(--portal-color-border)] object-cover"
                />
            )}

            {/* Description */}
            <p className="mt-6 whitespace-pre-wrap text-[var(--portal-color-text)]">{project.description}</p>

            {/* Tech stack */}
            {project.techStack.length > 0 && (
                <div className="mt-6">
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--portal-color-text-secondary)]">
                        Tech Stack
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                            <span
                                key={tech}
                                className="rounded-lg bg-[var(--portal-color-surface)] px-3 py-1 text-sm text-[var(--portal-color-text)]"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Links */}
            <div className="mt-8 flex gap-4">
                {project.liveUrl && (
                    <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-[var(--portal-color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        View Live →
                    </a>
                )}
                {project.repoUrl && (
                    <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-[var(--portal-color-border)] px-5 py-2.5 text-sm font-medium text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface)]"
                    >
                        Source Code
                    </a>
                )}
            </div>
        </div>
    );
}
