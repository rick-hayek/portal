'use client';

import { useEffect, useState } from 'react';

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
}

export default function PortfolioPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [techStacks, setTechStacks] = useState<string[]>([]);
    const [activeTech, setActiveTech] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/trpc/portfolio.list?batch=1&input=' + encodeURIComponent(JSON.stringify({
                '0': { json: activeTech ? { tech: activeTech } : null }
            }))).then(r => r.json()),
            fetch('/api/trpc/portfolio.techStacks?batch=1&input=' + encodeURIComponent(JSON.stringify({
                '0': { json: null }
            }))).then(r => r.json()),
        ]).then(([projectsData, techData]) => {
            setProjects(projectsData[0]?.result?.data?.json ?? []);
            setTechStacks(techData[0]?.result?.data?.json ?? []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [activeTech]);

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <h1 className="text-3xl font-bold text-[var(--portal-color-text)]">Portfolio</h1>
            <p className="mt-2 text-[var(--portal-color-text-secondary)]">Projects I&rsquo;ve built</p>

            {/* Tech filter */}
            {techStacks.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveTech(null)}
                        className={`rounded-full px-3 py-1 text-sm transition-colors ${!activeTech
                                ? 'bg-[var(--portal-color-primary)] text-white'
                                : 'border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]'
                            }`}
                    >
                        All
                    </button>
                    {techStacks.map((tech) => (
                        <button
                            key={tech}
                            onClick={() => setActiveTech(tech)}
                            className={`rounded-full px-3 py-1 text-sm transition-colors ${activeTech === tech
                                    ? 'bg-[var(--portal-color-primary)] text-white'
                                    : 'border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]'
                                }`}
                        >
                            {tech}
                        </button>
                    ))}
                </div>
            )}

            {/* Projects grid */}
            {loading ? (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-72 animate-pulse rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]" />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <p className="mt-12 text-center text-[var(--portal-color-text-secondary)]">No projects yet.</p>
            ) : (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <a
                            key={project.id}
                            href={`/portfolio/${project.slug}`}
                            className="group overflow-hidden rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] transition-all hover:border-[var(--portal-color-primary)] hover:shadow-lg"
                        >
                            {/* Cover */}
                            <div className="relative aspect-video bg-[var(--portal-color-background)]">
                                {project.coverImage ? (
                                    <img
                                        src={project.coverImage}
                                        alt={project.title}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-4xl text-[var(--portal-color-text-secondary)]">
                                        🚀
                                    </div>
                                )}
                                {project.featured && (
                                    <span className="absolute left-2 top-2 rounded-full bg-[var(--portal-color-primary)] px-2 py-0.5 text-xs font-medium text-white">
                                        Featured
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-semibold text-[var(--portal-color-text)] group-hover:text-[var(--portal-color-primary)]">
                                    {project.title}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-sm text-[var(--portal-color-text-secondary)]">
                                    {project.description}
                                </p>
                                {project.techStack.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {project.techStack.slice(0, 4).map((tech) => (
                                            <span
                                                key={tech}
                                                className="rounded-md bg-[var(--portal-color-background)] px-1.5 py-0.5 text-xs text-[var(--portal-color-text-secondary)]"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                        {project.techStack.length > 4 && (
                                            <span className="text-xs text-[var(--portal-color-text-secondary)]">
                                                +{project.techStack.length - 4}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
