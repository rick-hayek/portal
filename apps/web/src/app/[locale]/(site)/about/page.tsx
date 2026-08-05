'use client';

import {
  BookOpen,
  Cpu,
  ExternalLink,
  Flame,
  FolderGit2,
  GitBranch,
  Github,
  Layers,
  Link2,
  Wrench,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { useLocalSWR } from '@/hooks/useLocalSWR';
import siteConfig from '@/site.config';

interface SocialLink {
  label: string;
  href: string;
  icon?: string;
  displayMode?: 'icon' | 'text' | 'both';
}

export default function AboutPage() {
  const locale = useLocale();
  const t = useTranslations('About');
  const isEn = locale === 'en';

  const { data: aboutData, loading: isLoading } = useLocalSWR(
    'about-info',
    useCallback(async () => {
      const res = await fetch(
        '/api/trpc/about.getAbout?batch=1&input=' +
        encodeURIComponent(JSON.stringify({ '0': { json: null } })),
      );
      const json = await res.json();
      return json[0]?.result?.data?.json ?? null;
    }, []),
  );

  const subtitle = (isEn && aboutData?.subtitle_en) || aboutData?.subtitle || t('subtitle');
  const title = (isEn && aboutData?.title_en) || aboutData?.title || t('title');
  const rawDescription =
    (isEn && aboutData?.description_en) ||
    aboutData?.description ||
    `${t('intro1')}\n\n${t('intro2')}\n\n${t('intro3')}`;
  const paragraphs = rawDescription.split(/\n\s*\n/).filter((p: string) => p.trim().length > 0);

  const rawExperiences =
    aboutData?.experiences && aboutData.experiences.length > 0
      ? aboutData.experiences
      : [
        {
          role: t('jobs.senior'),
          company: 'Tech Corp',
          period: `2023 — ${t('jobs.present')}`,
          public: true,
        },
        { role: t('jobs.stack'), company: 'Startup Inc', period: '2020 — 2023', public: true },
        { role: t('jobs.frontend'), company: 'Web Studio', period: '2018 — 2020', public: true },
      ];

  const experiences = rawExperiences.filter((exp: any) => exp.public !== false);

  const rawSocialLinks =
    aboutData?.socialLinks && aboutData.socialLinks.length > 0
      ? (aboutData.socialLinks as SocialLink[])
      : ((siteConfig.about?.socialLinks as SocialLink[]) ?? []);

  const socialLinks: SocialLink[] = [...rawSocialLinks];

  // Parse Email JSON object or fallback string
  const emailObj = aboutData?.email || siteConfig.about?.email;
  let emailAddress = '';
  let emailIcon: string | undefined;
  let emailDisplayMode: 'icon' | 'text' | 'both' = 'both';

  if (typeof emailObj === 'object' && emailObj !== null && 'address' in emailObj) {
    const e = emailObj as {
      address: string;
      icon?: string;
      displayMode?: 'icon' | 'text' | 'both';
    };
    emailAddress = e.address;
    emailIcon = e.icon;
    emailDisplayMode = e.displayMode || 'both';
  } else if (typeof emailObj === 'string') {
    emailAddress = emailObj;
  } else if (process.env.NEXT_PUBLIC_EMAIL) {
    emailAddress = process.env.NEXT_PUBLIC_EMAIL;
  }

  if (emailAddress && !socialLinks.some((link) => link.label.toLowerCase() === 'email')) {
    socialLinks.push({
      label: 'Email',
      href: emailAddress.startsWith('mailto:') ? emailAddress : `mailto:${emailAddress}`,
      icon: emailIcon,
      displayMode: emailDisplayMode,
    });
  }

  const githubRepoUrl = 'https://github.com/rick-hayek/portal';

  return (
    <div className="flex w-full flex-col items-center">
      {/* Section 1: About Me */}
      <section className="mx-auto w-full max-w-[1200px] px-8" style={{ padding: '6rem 2rem 4rem' }}>
        {/* Section Header */}
        <div
          style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '3rem' }}
        >
          <span
            style={{
              width: '28px',
              height: '2px',
              background: 'var(--portal-color-primary)',
              flexShrink: 0,
            }}
          ></span>
          <span
            style={{
              fontFamily: 'var(--portal-font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--portal-color-primary)',
              fontWeight: 500,
            }}
          >
            {subtitle}
          </span>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--portal-color-text)',
            }}
          >
            {title}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Intro Text */}
          <div className="space-y-6 text-[1.05rem] leading-relaxed text-[var(--portal-color-text-secondary)]">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 w-full animate-pulse rounded-md bg-[var(--portal-color-surface-alt)]" />
                <div className="h-4 w-5/6 animate-pulse rounded-md bg-[var(--portal-color-surface-alt)]" />
                <div className="h-4 w-4/6 animate-pulse rounded-md bg-[var(--portal-color-surface-alt)]" />
              </div>
            ) : (
              paragraphs.map((p: string, idx: number) => <p key={idx}>{p}</p>)
            )}

            <div className="pt-4 flex flex-wrap items-center gap-4">
              {socialLinks.map((link: SocialLink) => {
                const mode = link.displayMode || 'both';
                const showIcon = (mode === 'icon' || mode === 'both') && !!link.icon;
                const showText = mode === 'text' || mode === 'both' || !link.icon;

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noreferrer"
                    title={link.label}
                    className="inline-flex items-center gap-1.5 text-[var(--portal-color-text-tertiary)] hover:text-[var(--portal-color-primary)] transition-colors text-sm font-medium"
                  >
                    {showIcon && (
                      <span
                        className="inline-flex items-center justify-center shrink-0 text-current [&>svg]:w-4 [&>svg]:h-4"
                        dangerouslySetInnerHTML={{ __html: link.icon! }}
                      />
                    )}
                    {showText && link.label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Experience Card */}
          <div
            style={{
              background: 'var(--portal-color-surface)',
              border: '1px solid var(--portal-color-border)',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: 'var(--portal-shadow)',
            }}
          >
            <h3 className="mb-6 text-lg font-bold text-[var(--portal-color-text)]">
              {t('experience')}
            </h3>
            <div className="space-y-0">
              {experiences.map(
                (job: { role: string; company: string; period: string }, i: number) => (
                  <div
                    key={i}
                    className="flex items-baseline justify-between border-b border-[var(--portal-color-border-soft)] py-4 last:border-0 last:pb-0 first:pt-0"
                  >
                    <div>
                      <div className="font-semibold text-[var(--portal-color-text)]">
                        {job.role}
                      </div>
                      <div className="text-sm text-[var(--portal-color-text-secondary)]">
                        {job.company}
                      </div>
                    </div>
                    <div className="font-mono text-xs text-[var(--portal-color-text-tertiary)]">
                      {job.period}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: About Site */}
      <section
        className="mx-auto w-full max-w-[1200px] px-8 border-t border-[var(--portal-color-border)]/60"
        style={{ padding: '5rem 2rem 6rem' }}
      >
        {/* Section Header */}
        <div
          style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '2.5rem' }}
        >
          <span
            style={{
              width: '28px',
              height: '2px',
              background: 'var(--portal-color-primary)',
              flexShrink: 0,
            }}
          ></span>
          <span
            style={{
              fontFamily: 'var(--portal-font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--portal-color-primary)',
              fontWeight: 500,
            }}
          >
            {t('siteSubtitle')}
          </span>
          <h2
            style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--portal-color-text)',
            }}
          >
            {t('siteTitle')}
          </h2>
        </div>

        <p className="max-w-3xl text-[1.05rem] leading-relaxed text-[var(--portal-color-text-secondary)] mb-10">
          {t('siteDesc')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Modules */}
          <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 sm:p-8 shadow-sm transition-all hover:border-[var(--portal-color-primary)]/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--portal-color-primary)]/10 text-[var(--portal-color-primary)]">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--portal-color-text)]">
                {t('modulesTitle')}
              </h3>
            </div>
            <ul className="space-y-3.5 text-sm text-[var(--portal-color-text-secondary)]">
              <li className="flex items-start gap-2.5">
                <BookOpen className="h-4 w-4 shrink-0 text-[var(--portal-color-primary)] mt-0.5" />
                <span>{t('modules.blog')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Flame className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                <span>{t('modules.trending')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FolderGit2 className="h-4 w-4 shrink-0 text-[var(--portal-color-primary)] mt-0.5" />
                <span>{t('modules.portfolio')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <BookOpen className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <span>{t('modules.books')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Link2 className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                <span>{t('modules.links')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Wrench className="h-4 w-4 shrink-0 text-purple-500 mt-0.5" />
                <span>{t('modules.tools')}</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Tech Stack */}
          <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 sm:p-8 shadow-sm transition-all hover:border-[var(--portal-color-primary)]/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--portal-color-primary)]/10 text-[var(--portal-color-primary)]">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[var(--portal-color-text)]">
                  {t('techTitle')}
                </h3>
              </div>
              <div className="space-y-3.5 text-sm text-[var(--portal-color-text-secondary)]">
                <div className="rounded-xl bg-[var(--portal-color-surface-alt)]/60 p-3.5 border border-[var(--portal-color-border)]/40">
                  <span className="font-semibold text-[var(--portal-color-text)] block mb-1 text-xs uppercase tracking-wider">
                    Core Framework
                  </span>
                  <span>{t('tech.core')}</span>
                </div>
                <div className="rounded-xl bg-[var(--portal-color-surface-alt)]/60 p-3.5 border border-[var(--portal-color-border)]/40">
                  <span className="font-semibold text-[var(--portal-color-text)] block mb-1 text-xs uppercase tracking-wider">
                    API & Database
                  </span>
                  <span>{t('tech.api')}</span>
                </div>
                <div className="rounded-xl bg-[var(--portal-color-surface-alt)]/60 p-3.5 border border-[var(--portal-color-border)]/40">
                  <span className="font-semibold text-[var(--portal-color-text)] block mb-1 text-xs uppercase tracking-wider">
                    Search & Storage
                  </span>
                  <span>{t('tech.search')}</span>
                </div>
                <div className="rounded-xl bg-[var(--portal-color-surface-alt)]/60 p-3.5 border border-[var(--portal-color-border)]/40">
                  <span className="font-semibold text-[var(--portal-color-text)] block mb-1 text-xs uppercase tracking-wider">
                    i18n & Auth
                  </span>
                  <span>{t('tech.feature')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner: Open Source & GitHub Link */}
        <div className="mt-8 rounded-2xl border border-[var(--portal-color-primary)]/30 bg-gradient-to-r from-[var(--portal-color-primary)]/10 via-[var(--portal-color-surface)] to-[var(--portal-color-surface)] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--portal-color-primary)]">
              <GitBranch className="h-4 w-4" />
              <span>{t('openSourceTitle')}</span>
            </div>
            <p className="text-sm text-[var(--portal-color-text-secondary)] leading-relaxed">
              {t('openSourceDesc')}
            </p>
          </div>
          {githubRepoUrl && (
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-xl bg-[var(--portal-color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 hover:-translate-y-0.5 shrink-0"
            >
              <Github className="h-4 w-4" />
              <span>{t('viewOnGithub')}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
