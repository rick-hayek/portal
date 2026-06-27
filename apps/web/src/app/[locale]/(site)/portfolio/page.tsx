'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  descriptionEn?: string | null;
  coverImage: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  techStack: string[];
  featured: boolean;
  logo?: string | null;
  downloadLinks?: any;
}

export default function PortfolioPage() {
  const t = useTranslations('Portfolio');
  const locale = useLocale();
  const [projects, setProjects] = useState<Project[]>([]);
  const [techStacks, setTechStacks] = useState<string[]>([]);
  const [activeTech, setActiveTech] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(
        '/api/trpc/portfolio.list?batch=1&input=' +
          encodeURIComponent(
            JSON.stringify({
              '0': { json: activeTech ? { tech: activeTech } : {} },
            }),
          ),
      ).then((r) => r.json()),
      fetch(
        '/api/trpc/portfolio.techStacks?batch=1&input=' +
          encodeURIComponent(
            JSON.stringify({
              '0': { json: null },
            }),
          ),
      ).then((r) => r.json()),
    ])
      .then(([projectsData, techData]) => {
        setProjects(projectsData[0]?.result?.data?.json ?? []);
        setTechStacks(techData[0]?.result?.data?.json ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTech]);

  return (
    <div className="border-t border-b border-compat-soft bg-[var(--portal-color-surface)]">
      <div style={{ padding: '5rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {/* Section header */}
        <div className="flex items-baseline" style={{ gap: '.8rem', marginBottom: '2.5rem' }}>
          <span
            style={{
              width: 28,
              height: 2,
              background: 'var(--portal-color-primary)',
              flexShrink: 0,
            }}
          ></span>
          <span
            className="font-mono uppercase text-[var(--portal-color-primary)]"
            style={{ fontSize: '.7rem', fontWeight: 500, letterSpacing: '.1em' }}
          >
            {t('selectedWork')}
          </span>
          <h1
            className="text-[var(--portal-color-text)]"
            style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.03em' }}
          >
            {t('title')}
          </h1>
        </div>

        {/* Tech filter */}
        {techStacks.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTech(null)}
              className={`rounded-full transition-colors ${
                !activeTech
                  ? 'bg-[var(--portal-color-primary)] text-white'
                  : 'border border-compat text-[var(--portal-color-text-secondary)] hover-border-compat-primary'
              }`}
              style={{ padding: '.3rem .85rem', fontSize: '.78rem', fontWeight: 500 }}
            >
              {t('all')}
            </button>
            {techStacks.map((tech) => (
              <button
                key={tech}
                onClick={() => setActiveTech(tech)}
                className={`rounded-full transition-colors ${
                  activeTech === tech
                    ? 'bg-[var(--portal-color-primary)] text-white'
                    : 'border border-compat text-[var(--portal-color-text-secondary)] hover-border-compat-primary'
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
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem' }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse border border-compat"
                style={{
                  height: 320,
                  borderRadius: 16,
                  background: 'var(--portal-color-background)',
                }}
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="py-12 text-center text-[var(--portal-color-text-secondary)]">
            {t('noProjects')}
          </p>
        ) : (
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem' }}
          >
            {projects.map((project) => (
              <a
                key={project.id}
                href={`/portfolio/${project.slug}`}
                className="group cursor-pointer overflow-hidden border border-compat hover-border-compat-primary no-underline transition-all duration-300 hover:-translate-y-1"
                style={{ background: 'var(--portal-color-background)', borderRadius: 16 }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,.08)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* Cover */}
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    height: 180,
                    background:
                      'linear-gradient(135deg, var(--portal-color-surface-alt), rgba(107,142,201,.06))',
                    fontSize: '3rem',
                  }}
                >
                  {project.coverImage ? (
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    '🚀'
                  )}
                  {project.featured && (
                    <span
                      className="absolute uppercase text-white"
                      style={{
                        top: 10,
                        left: 10,
                        background: 'var(--portal-color-primary)',
                        borderRadius: 100,
                        padding: '.2rem .6rem',
                        fontSize: '.58rem',
                        fontWeight: 700,
                        letterSpacing: '.05em',
                      }}
                    >
                      {t('featured')}
                    </span>
                  )}
                  {project.downloadLinks &&
                    (() => {
                      try {
                        const links =
                          typeof project.downloadLinks === 'string'
                            ? JSON.parse(project.downloadLinks)
                            : project.downloadLinks;
                        if (!Array.isArray(links) || links.length === 0) return null;
                        const platforms = new Set(links.map((l) => l.platform));
                        return (
                          <div className="absolute flex gap-1" style={{ top: 10, right: 10 }}>
                            {platforms.has('appstore') && (
                              <span
                                title="App Store"
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white"
                              >
                                🍎
                              </span>
                            )}
                            {platforms.has('playstore') && (
                              <span
                                title="Google Play"
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white"
                              >
                                🤖
                              </span>
                            )}
                            {platforms.has('macos') && (
                              <span
                                title="macOS"
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white"
                              >
                                💻
                              </span>
                            )}
                            {platforms.has('windows') && (
                              <span
                                title="Windows"
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white"
                              >
                                🪟
                              </span>
                            )}
                            {platforms.has('linux') && (
                              <span
                                title="Linux"
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white"
                              >
                                🐧
                              </span>
                            )}
                            {platforms.has('apk') && (
                              <span
                                title="APK"
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-[7px] font-bold text-white leading-none"
                              >
                                APK
                              </span>
                            )}
                          </div>
                        );
                      } catch {
                        return null;
                      }
                    })()}
                </div>

                {/* Info */}
                <div style={{ padding: '1.3rem' }}>
                  <div
                    className="text-[var(--portal-color-text)] group-hover:text-[var(--portal-color-primary)] transition-colors flex items-center gap-2"
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      marginBottom: '.3rem',
                      letterSpacing: '-.02em',
                    }}
                  >
                    {project.logo && (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded">
                        {project.logo.includes('<svg') ? (
                          <div
                            className="h-full w-full [&_svg]:h-full [&_svg]:w-full"
                            dangerouslySetInnerHTML={{ __html: project.logo }}
                          />
                        ) : (
                          <img src={project.logo} alt="" className="h-full w-full object-contain" />
                        )}
                      </div>
                    )}
                    <span>{project.title}</span>
                  </div>
                  <div
                    className="line-clamp-2 text-[var(--portal-color-text-secondary)]"
                    style={{ fontSize: '.82rem', lineHeight: 1.6, marginBottom: '.8rem' }}
                  >
                    {locale === 'en' && project.descriptionEn
                      ? project.descriptionEn
                      : project.description}
                  </div>
                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap font-mono" style={{ gap: '.3rem' }}>
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[var(--portal-color-primary)]"
                          style={{
                            fontSize: '.6rem',
                            fontWeight: 500,
                            padding: '.2rem .5rem',
                            borderRadius: 6,
                            background: 'rgba(107,142,201,.08)',
                          }}
                        >
                          {tech}
                        </span>
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
