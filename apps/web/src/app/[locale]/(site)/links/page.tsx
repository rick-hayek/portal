import {
  ArrowUpRight,
  Link2,
  Rss,
  Share2,
  UserPlus,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import React from 'react';
import { LinksApplyActions, LinksCopyableFields } from '@/components/links/LinksClientSection';
import { getTRPCServer } from '@/lib/trpc-server';

export const revalidate = 60; // ISR cache for 60 seconds

function getInitials(name: string): string {
  if (!name) return '?';
  const cleaned = name.trim();
  const words = cleaned.split(/[\s\-_]+/).filter(Boolean);
  if (words.length >= 2) {
    const first = words[0][0];
    const second = words[1][0];
    return (first + second).toUpperCase();
  }
  if (/[\u4e00-\u9fa5]/.test(cleaned)) {
    return cleaned.slice(0, 2);
  }
  return cleaned.slice(0, 2).toUpperCase();
}

export default async function LinksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Links' });
  const trpcServer = await getTRPCServer();

  const [links, selfLink, aboutData] = await Promise.all([
    trpcServer.link.list(),
    trpcServer.link.getSelf(),
    trpcServer.about.getAbout(),
  ]);

  let targetEmail = 'ricksname@your-site.com';
  if (process.env.NEXT_PUBLIC_EMAIL) {
    targetEmail = process.env.NEXT_PUBLIC_EMAIL;
  } else if (aboutData?.email) {
    if (typeof aboutData.email === 'object' && 'address' in (aboutData.email as any)) {
      targetEmail = (aboutData.email as any).address;
    } else if (typeof aboutData.email === 'string') {
      targetEmail = aboutData.email;
    }
  }

  const siteName = selfLink?.name || 'Voocii';
  const siteUrl = selfLink?.url || 'https://portal.dev';
  const siteRss = selfLink?.rss || '';
  const siteAvatar = selfLink?.avatar || '';
  const siteScreenshot = selfLink?.screenshot || '';
  const siteDesc =
    selfLink?.description ||
    'A personal space dedicated to sharing tech insights, life reflections, and practical tool development stories.';

  // Group links by category
  const groupedLinks =
    links?.reduce(
      (acc, link) => {
        const cat = link.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(link);
        return acc;
      },
      {} as Record<string, typeof links>,
    ) || {};

  const categoryTitles: Record<string, string> = {
    friend: t('categories.friend'),
    tool: t('categories.tool'),
    inspiration: t('categories.inspiration'),
    other: t('categories.other'),
  };

  const selfFields = [
    { label: t('selfFields.name'), value: siteName, key: 'name' },
    { label: t('selfFields.desc'), value: siteDesc, key: 'desc' },
    { label: t('selfFields.url'), value: siteUrl, key: 'url' },
    ...(siteAvatar ? [{ label: t('selfFields.avatar'), value: siteAvatar, key: 'avatar' }] : []),
    ...(siteScreenshot
      ? [{ label: t('selfFields.screenshot'), value: siteScreenshot, key: 'screenshot' }]
      : []),
    ...(siteRss ? [{ label: t('selfFields.rss'), value: siteRss, key: 'rss' }] : []),
  ];

  const yamlSnippet = [
    `name: ${siteName}`,
    `url: ${siteUrl}`,
    `desc: ${siteDesc}`,
    ...(siteAvatar ? [`avatar: ${siteAvatar}`] : []),
    ...(siteScreenshot ? [`screenshot: ${siteScreenshot}`] : []),
    ...(siteRss ? [`rss: ${siteRss}`] : []),
  ].join('\n');

  const jsonSnippet = JSON.stringify(
    {
      name: siteName,
      url: siteUrl,
      desc: siteDesc,
      ...(siteAvatar ? { avatar: siteAvatar } : {}),
      ...(siteScreenshot ? { screenshot: siteScreenshot } : {}),
      ...(siteRss ? { rss: siteRss } : {}),
    },
    null,
    2,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 pt-8 sm:pt-12">
      <header className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(107,142,201,0.1)] text-[var(--portal-color-primary)]">
            <Link2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--portal-color-text)] sm:text-4xl md:text-5xl">
            {t('title')}
          </h1>
        </div>
        <p className="mx-auto max-w-2xl text-xs sm:text-base text-[var(--portal-color-text-secondary)]">
          {t('description')}
        </p>
      </header>

      {Object.entries(groupedLinks).map(([category, items]) => (
        <section key={category} className="space-y-8">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--portal-color-text)] flex items-center gap-3">
            <span className="flex-1 border-b border-compat content-['']"></span>
            <span className="px-4 text-[var(--portal-color-text-secondary)] uppercase tracking-wider text-sm font-semibold">
              {categoryTitles[category] || category}
            </span>
            <span className="flex-1 border-b border-compat content-['']"></span>
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {items.map((link) => {
              const avatarSrc = link.avatar || '';

              return (
                <React.Fragment key={link.id}>
                  {/* Desktop Card (Horizontal + Hover Floating Preview) */}
                  <div className="group relative hidden sm:block rounded-2xl">
                    {/* Main Card Clickable Overlay Link */}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-10 rounded-2xl cursor-pointer"
                    />

                    {/* Floating Screenshot Preview Tooltip */}
                    {link.screenshot && (
                      <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-30 w-64 sm:w-72 p-1.5 rounded-2xl border border-compat bg-[var(--portal-color-surface)] shadow-[0_16px_40px_rgba(0,0,0,0.15)] opacity-0 scale-95 translate-y-2 pointer-events-none transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0">
                        <div className="overflow-hidden rounded-xl bg-[var(--portal-color-bg)] aspect-[16/10] relative">
                          <img
                            src={link.screenshot}
                            alt={`${link.name} screenshot`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      </div>
                    )}

                    {/* Inner Body */}
                    <div className="flex flex-row items-start gap-3.5 sm:gap-4 rounded-2xl border border-compat hover-border-compat-primary bg-[var(--portal-color-surface)] p-4 sm:p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(107,142,201,0.05)]">
                      <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--portal-color-primary-soft)] border border-compat transition-transform group-hover:scale-110 text-[var(--portal-color-primary)] font-bold text-xs sm:text-sm font-mono tracking-wider select-none">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={link.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <span>{getInitials(link.name)}</span>
                        )}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold leading-snug tracking-tight text-[var(--portal-color-text)] text-sm sm:text-base truncate">
                            {link.name}
                          </h3>
                          {link.rss ? (
                            <a
                              href={link.rss}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`RSS: ${link.rss}`}
                              className="relative z-20 flex h-6 w-6 sm:h-6.5 sm:w-6.5 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
                            >
                              <Rss className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </a>
                          ) : (
                            <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-[var(--portal-color-bg)] text-[var(--portal-color-text-tertiary)] transition-colors group-hover:bg-[var(--portal-color-primary)] group-hover:text-white">
                              <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </div>
                          )}
                        </div>
                        {link.description && (
                          <p className="line-clamp-2 text-xs sm:text-sm text-[var(--portal-color-text-secondary)]">
                            {link.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Card */}
                  <div className="group relative flex sm:hidden flex-col overflow-hidden rounded-2xl border border-compat bg-[var(--portal-color-surface)] shadow-xs transition-transform active:scale-[0.98]">
                    {/* Main Card Clickable Overlay Link */}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-10"
                    />

                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--portal-color-bg)]">
                      {link.rss && (
                        <a
                          href={link.rss}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`RSS: ${link.rss}`}
                          className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-orange-500 backdrop-blur-md border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-colors"
                        >
                          <Rss className="h-3 w-3" />
                        </a>
                      )}

                      {link.screenshot ? (
                        <img
                          src={link.screenshot}
                          alt={link.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : avatarSrc ? (
                        <div className="relative h-full w-full overflow-hidden">
                          <img
                            src={avatarSrc}
                            alt={link.name}
                            className="h-full w-full object-cover blur-md scale-110 opacity-60"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-black/20" />
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--portal-color-primary-soft)] to-[var(--portal-color-surface-alt)]">
                          <Link2 className="h-8 w-8 text-[var(--portal-color-primary)] opacity-40" />
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                      <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-end gap-2 text-white">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border-1.5 border-white/80 bg-black/40 backdrop-blur-xs font-bold text-[10px] text-white shadow-xs">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={link.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <span>{getInitials(link.name)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 leading-tight">
                          <h3 className="truncate font-bold text-xs text-white drop-shadow-xs">
                            {link.name}
                          </h3>
                          {link.description && (
                            <p className="truncate text-[10px] text-white/80 drop-shadow-xs mt-0.5">
                              {link.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </section>
      ))}

      {links?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-compat p-12 text-center">
          <Link2 className="mb-4 h-12 w-12 text-[var(--portal-color-text-tertiary)]" />
          <h3 className="mb-2 text-lg font-medium text-[var(--portal-color-text)]">
            {t('noLinks')}
          </h3>
          <p className="text-sm text-[var(--portal-color-text-secondary)]">{t('noLinksDesc')}</p>
        </div>
      )}

      {/* Apply for Friendship Link Section */}
      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--portal-color-text)] flex items-center gap-3">
          <span className="flex-1 border-b border-compat content-['']"></span>
          <span className="px-4 text-[var(--portal-color-text-secondary)] uppercase tracking-wider text-sm font-semibold flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-[var(--portal-color-primary)]" />
            {t('applyTitle')}
          </span>
          <span className="flex-1 border-b border-compat content-['']"></span>
        </h2>

        <div className="rounded-3xl border border-compat bg-[var(--portal-color-surface)] p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <p className="text-sm sm:text-base text-[var(--portal-color-text-secondary)] leading-relaxed">
            {t('applyDesc')}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--portal-color-bg)] p-5 border border-compat space-y-2">
              <h3 className="font-semibold text-sm text-[var(--portal-color-text)] flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--portal-color-primary-soft)] text-xs font-bold text-[var(--portal-color-primary)]">
                  1
                </span>
                {t('step1Title')}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--portal-color-text-secondary)] leading-relaxed">
                {t('step1Desc')}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--portal-color-bg)] p-5 border border-compat space-y-2">
              <h3 className="font-semibold text-sm text-[var(--portal-color-text)] flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--portal-color-primary-soft)] text-xs font-bold text-[var(--portal-color-primary)]">
                  2
                </span>
                {t('step2Title')}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--portal-color-text-secondary)] leading-relaxed">
                {t('step2Desc')}
              </p>
            </div>
          </div>

          <LinksApplyActions targetEmail={targetEmail} />
        </div>
      </section>

      {/* Site Link Info Section */}
      <section className="mt-16 space-y-6 pb-12">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--portal-color-text)] flex items-center gap-3">
          <span className="flex-1 border-b border-compat content-['']"></span>
          <span className="px-4 text-[var(--portal-color-text-secondary)] uppercase tracking-wider text-sm font-semibold flex items-center gap-2">
            <Share2 className="h-4 w-4 text-[var(--portal-color-primary)]" />
            {t('selfInfoTitle')}
          </span>
          <span className="flex-1 border-b border-compat content-['']"></span>
        </h2>

        <LinksCopyableFields
          fields={selfFields}
          yamlSnippet={yamlSnippet}
          jsonSnippet={jsonSnippet}
        />
      </section>
    </div>
  );
}
