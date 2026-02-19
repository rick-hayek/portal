'use client';

export default function AboutPage() {
    return (
        <div className="flex w-full flex-col items-center">
            <section className="mx-auto w-full max-w-[1200px] px-8" style={{ padding: '8rem 2rem 5rem' }}>
                {/* Section Header */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '3rem' }}>
                    <span style={{ width: '28px', height: '2px', background: 'var(--portal-color-primary)', flexShrink: 0 }}></span>
                    <span style={{ fontFamily: 'var(--portal-font-mono)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--portal-color-primary)', fontWeight: 500 }}>About Me</span>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--portal-color-text)' }}>The Developer</h1>
                </div>

                <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
                    {/* Intro Text */}
                    <div className="space-y-6 text-[1.05rem] leading-relaxed text-[var(--portal-color-text-secondary)]">
                        <p>
                            Hello! I'm Rick, a Full-Stack Engineer who loves building tools that make development easier and more enjoyable.
                        </p>
                        <p>
                            With a background in computer science and years of experience in the JavaScript ecosystem, I focus on creating performant, accessible, and beautiful web applications.
                        </p>
                        <p>
                            When I'm not coding, you can find me exploring new technologies, contributing to open source, or sharing my knowledge through writing.
                        </p>

                        <div className="pt-4 flex gap-4">
                            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[var(--portal-color-text-tertiary)] hover:text-[var(--portal-color-primary)] transition-colors">
                                GitHub
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-[var(--portal-color-text-tertiary)] hover:text-[var(--portal-color-primary)] transition-colors">
                                Twitter
                            </a>
                        </div>
                    </div>

                    {/* Experience Card */}
                    <div style={{
                        background: 'var(--portal-color-surface)',
                        border: '1px solid var(--portal-color-border)',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: 'var(--portal-shadow)'
                    }}>
                        <h3 className="mb-6 text-lg font-bold text-[var(--portal-color-text)]">Experience</h3>
                        <div className="space-y-0">
                            {[
                                { role: 'Senior Developer', company: 'Tech Corp', period: '2023 — Present' },
                                { role: 'Full Stack Engineer', company: 'Startup Inc', period: '2020 — 2023' },
                                { role: 'Frontend Developer', company: 'Web Studio', period: '2018 — 2020' },
                            ].map((job, i) => (
                                <div key={i} className="flex items-baseline justify-between border-b border-[var(--portal-color-border-soft)] py-4 last:border-0 last:pb-0 first:pt-0">
                                    <div>
                                        <div className="font-semibold text-[var(--portal-color-text)]">{job.role}</div>
                                        <div className="text-sm text-[var(--portal-color-text-secondary)]">{job.company}</div>
                                    </div>
                                    <div className="font-mono text-xs text-[var(--portal-color-text-tertiary)]">{job.period}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
