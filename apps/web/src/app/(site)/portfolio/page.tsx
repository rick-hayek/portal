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
        <div className="border-t border-b border-[var(--portal-color-border-soft)] bg-[var(--portal-color-surface)]">
            <div style={{ padding: '5rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
                {/* Section header */}
                <div className="flex items-baseline" style={{ gap: '.8rem', marginBottom: '2.5rem' }}>
                    <span style={{ width: 28, height: 2, background: 'var(--portal-color-primary)', flexShrink: 0 }}></span>
                    <span className="font-mono uppercase text-[var(--portal-color-primary)]"
                        style={{ fontSize: '.7rem', fontWeight: 500, letterSpacing: '.1em' }}
                    >Selected Work</span>
                    <h1 className="text-[var(--portal-color-text)]"
                        style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.03em' }}
                    >Portfolio</h1>
                </div>

                {/* Tech filter */}
                {techStacks.length > 0 && (
                    <div className="mb-8 flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveTech(null)}
                            className={`rounded-full transition-colors ${!activeTech
                                ? 'bg-[var(--portal-color-primary)] text-white'
                                : 'border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]'
                                }`}
                            style={{ padding: '.3rem .85rem', fontSize: '.78rem', fontWeight: 500 }}
                        >
                            All
                        </button>
                        {techStacks.map((tech) => (
                            <button
                                key={tech}
                                onClick={() => setActiveTech(tech)}
                                className={`rounded-full transition-colors ${activeTech === tech
                                    ? 'bg-[var(--portal-color-primary)] text-white'
                                    : 'border border-[var(--portal-color-border)] text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-primary)]'
                                    }`}
                                style={{ padding: '.3rem .85rem', fontSize: '.78rem', fontWeight: 500 }}
                            >
                                {tech}
                            </button>
                        ))}
                    </div>
                )}

                {/* Projects grid */}
                {loading ? (
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem' }}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="animate-pulse border border-[var(--portal-color-border)]"
                                style={{ height: 320, borderRadius: 16, background: 'var(--portal-color-background)' }}
                            />
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <p className="py-12 text-center text-[var(--portal-color-text-secondary)]">No projects yet.</p>
                ) : (
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem' }}>
                        {projects.map((project) => (
                            <a
                                key={project.id}
                                href={`/portfolio/${project.slug}`}
                                className="group cursor-pointer overflow-hidden border border-[var(--portal-color-border)] no-underline transition-all duration-300 hover:-translate-y-1 hover:border-[var(--portal-color-primary)]"
                                style={{ background: 'var(--portal-color-background)', borderRadius: 16 }}
                                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,.08)')}
                                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                            >
                                {/* Cover */}
                                <div className="relative flex items-center justify-center"
                                    style={{ height: 180, background: 'linear-gradient(135deg, var(--portal-color-surface-alt), rgba(107,142,201,.06))', fontSize: '3rem' }}
                                >
                                    {project.coverImage ? (
                                        <img src={project.coverImage} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : '🚀'}
                                    {project.featured && (
                                        <span className="absolute uppercase text-white"
                                            style={{ top: 10, left: 10, background: 'var(--portal-color-primary)', borderRadius: 100, padding: '.2rem .6rem', fontSize: '.58rem', fontWeight: 700, letterSpacing: '.05em' }}
                                        >Featured</span>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={{ padding: '1.3rem' }}>
                                    <div className="text-[var(--portal-color-text)] group-hover:text-[var(--portal-color-primary)] transition-colors"
                                        style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.3rem', letterSpacing: '-.02em' }}
                                    >{project.title}</div>
                                    <div className="line-clamp-2 text-[var(--portal-color-text-secondary)]"
                                        style={{ fontSize: '.82rem', lineHeight: 1.6, marginBottom: '.8rem' }}
                                    >{project.description}</div>
                                    {project.techStack.length > 0 && (
                                        <div className="flex flex-wrap font-mono" style={{ gap: '.3rem' }}>
                                            {project.techStack.map((tech) => (
                                                <span key={tech} className="text-[var(--portal-color-primary)]"
                                                    style={{ fontSize: '.6rem', fontWeight: 500, padding: '.2rem .5rem', borderRadius: 6, background: 'rgba(107,142,201,.08)' }}
                                                >{tech}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
