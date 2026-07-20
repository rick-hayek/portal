'use client';

import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/api/client';
import siteConfig from '@/site.config';

interface SocialLink {
  label: string;
  href: string;
  icon?: string;
  displayMode?: 'icon' | 'text' | 'both';
}

export default function AboutPage() {
  const t = useTranslations('About');
  const { data: aboutData, isLoading } = trpc.about.getAbout.useQuery();

  const subtitle = aboutData?.subtitle || t('subtitle');
  const title = aboutData?.title || t('title');
  const rawDescription =
    aboutData?.description || `${t('intro1')}\n\n${t('intro2')}\n\n${t('intro3')}`;
  const paragraphs = rawDescription.split(/\n\s*\n/).filter((p: string) => p.trim().length > 0);

  const experiences =
    aboutData?.experiences && aboutData.experiences.length > 0
      ? aboutData.experiences
      : [
          {
            role: t('jobs.senior'),
            company: 'Tech Corp',
            period: `2023 — ${t('jobs.present')}`,
          },
          { role: t('jobs.stack'), company: 'Startup Inc', period: '2020 — 2023' },
          { role: t('jobs.frontend'), company: 'Web Studio', period: '2018 — 2020' },
        ];

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
    const e = emailObj as { address: string; icon?: string; displayMode?: 'icon' | 'text' | 'both' };
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

  return (
    <div className="flex w-full flex-col items-center">
      <section className="mx-auto w-full max-w-[1200px] px-8" style={{ padding: '6rem 2rem 5rem' }}>
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
              {experiences.map((job: { role: string; company: string; period: string }, i: number) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between border-b border-[var(--portal-color-border-soft)] py-4 last:border-0 last:pb-0 first:pt-0"
                >
                  <div>
                    <div className="font-semibold text-[var(--portal-color-text)]">{job.role}</div>
                    <div className="text-sm text-[var(--portal-color-text-secondary)]">
                      {job.company}
                    </div>
                  </div>
                  <div className="font-mono text-xs text-[var(--portal-color-text-tertiary)]">
                    {job.period}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
