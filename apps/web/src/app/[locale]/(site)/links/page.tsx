'use client';

import { ArrowUpRight, Check, Copy, Globe, Link2, Mail, Rss, Share2, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useLocalSWR } from '@/hooks/useLocalSWR';
import { trpc } from '@/lib/api/client';

function getInitials(name: string): string {
  if (!name) return '?';
  const cleaned = name.trim();
  const words = cleaned.split(/[\s\-_]+/).filter(Boolean);
  if (words.length >= 2) {
    const first = words[0][0];
    const second = words[1][0];
    return (first + second).toUpperCase();
  }
  // Single word or CJK
  if (/[\u4e00-\u9fa5]/.test(cleaned)) {
    return cleaned.slice(0, 2);
  }
  return cleaned.slice(0, 2).toUpperCase();
}

export default function LinksPage() {
  const t = useTranslations('Links');
  const trpcUtils = trpc.useUtils();

  const { data: links, loading: isLoading } = useLocalSWR(
    'portal:links:list',
    React.useCallback(() => trpcUtils.link.list.fetch(), [trpcUtils])
  );
  const { data: selfLink } = useLocalSWR(
    'portal:links:self',
    React.useCallback(() => trpcUtils.link.getSelf.fetch(), [trpcUtils])
  );
  const { data: aboutData } = useLocalSWR(
    'portal:about:info',
    React.useCallback(() => trpcUtils.about.getAbout.fetch(), [trpcUtils])
  );
  const [copiedType, setCopiedType] = React.useState<string | null>(null);

  let targetEmail = 'rick@example.com';
  if (aboutData?.email) {
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
  const siteDesc =
    selfLink?.description ||
    'A personal space dedicated to sharing tech insights, life reflections, and practical tool development stories.';

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const markdownSnippet = `[${siteName}](${siteUrl}) - ${siteDesc}`;
  const jsonSnippet = JSON.stringify(
    {
      name: siteName,
      url: siteUrl,
      ...(siteAvatar ? { avatar: siteAvatar } : {}),
      desc: siteDesc,
      ...(siteRss ? { rss: siteRss } : {}),
    },
    null,
    2,
  );



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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((link) => {
              const avatarSrc = link.avatar || '';

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-row items-start gap-3.5 sm:gap-4 rounded-2xl border border-compat hover-border-compat-primary bg-[var(--portal-color-surface)] p-4 sm:p-5 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(107,142,201,0.05)]"
                >
                  {/* Floating Screenshot Preview Tooltip */}
                  {link.screenshot && (
                    <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-30 w-64 sm:w-72 p-1.5 rounded-2xl border border-compat bg-[var(--portal-color-surface)] shadow-[0_16px_40px_rgba(0,0,0,0.15)] opacity-0 scale-95 translate-y-2 pointer-events-none transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0">
                      <div className="overflow-hidden rounded-xl bg-[var(--portal-color-bg)] aspect-[16/10] relative">
                        <img
                          src={link.screenshot}
                          alt={`${link.name} screenshot`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--portal-color-primary-soft)] border border-compat transition-transform group-hover:scale-110 text-[var(--portal-color-primary)] font-bold text-xs sm:text-sm font-mono tracking-wider select-none">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={link.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
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
                        <button
                          type="button"
                          title={`RSS: ${link.rss}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(link.rss!, '_blank', 'noopener,noreferrer');
                          }}
                          className="flex h-6 w-6 sm:h-6.5 sm:w-6.5 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
                        >
                          <Rss className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
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
                </a>
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
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--portal-color-primary-soft)] text-xs font-bold text-[var(--portal-color-primary)]">1</span>
                {t('step1Title')}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--portal-color-text-secondary)] leading-relaxed">
                {t('step1Desc')}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--portal-color-bg)] p-5 border border-compat space-y-2">
              <h3 className="font-semibold text-sm text-[var(--portal-color-text)] flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--portal-color-primary-soft)] text-xs font-bold text-[var(--portal-color-primary)]">2</span>
                {t('step2Title')}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--portal-color-text-secondary)] leading-relaxed">
                {t('step2Desc')}
              </p>
            </div>
          </div>

          {/* Buttons: Send Email & Copy Application Template */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={`mailto:${targetEmail}?subject=${encodeURIComponent('友情链接申请')}&body=${encodeURIComponent(`站点名称：\n站点链接：\n站点描述：\n头像链接：\nRSS订阅：\n网页截图：`)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--portal-color-primary)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-sm cursor-pointer no-underline"
            >
              <Mail className="h-4 w-4" />
              <span>{t('sendEmailBtn')}</span>
            </a>

            <button
              type="button"
              onClick={() => handleCopy(`站点名称：\n站点链接：\n站点描述：\n头像链接：\nRSS订阅：\n网页截图：`, 'template')}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--portal-color-surface-alt)] hover:bg-[var(--portal-color-border-soft)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--portal-color-text)] border border-compat transition-all cursor-pointer"
            >
              {copiedType === 'template' ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>{t('templateCopied')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>{t('copyTemplateBtn')}</span>
                </>
              )}
            </button>
          </div>
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

        <div className="space-y-3">
          {[
            { label: t('selfFields.name'), value: siteName, key: 'name' },
            { label: t('selfFields.desc'), value: siteDesc, key: 'desc' },
            { label: t('selfFields.url'), value: siteUrl, key: 'url' },
            ...(siteAvatar ? [{ label: t('selfFields.avatar'), value: siteAvatar, key: 'avatar' }] : []),
            ...(siteRss ? [{ label: t('selfFields.rss'), value: siteRss, key: 'rss' }] : []),
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--portal-color-surface)] px-4 py-3 sm:px-5 sm:py-3.5 transition-colors border border-[var(--portal-color-border)]/30 hover:border-[var(--portal-color-border)]/70"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-medium text-[var(--portal-color-text-tertiary)] shrink-0 w-16 sm:w-20">
                  {item.label}
                </span>
                <div className="text-sm font-medium text-[var(--portal-color-text)] truncate font-sans min-w-0 flex-1">
                  {item.value}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(item.value, item.key)}
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--portal-color-bg)] text-[var(--portal-color-text-tertiary)] hover:text-[var(--portal-color-primary)] transition-colors cursor-pointer"
                title={`Copy ${item.label}`}
              >
                {copiedType === item.key ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}

          {/* Quick Markdown & JSON batch copy buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => handleCopy(jsonSnippet, 'json')}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--portal-color-surface)] hover:bg-[var(--portal-color-primary)] hover:text-white px-4 py-2.5 text-xs font-semibold text-[var(--portal-color-text)] border border-[var(--portal-color-border)]/50 transition-all shadow-2xs cursor-pointer"
            >
              {copiedType === 'json' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{t('copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t('copyJson')}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleCopy(markdownSnippet, 'markdown')}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--portal-color-surface)] hover:bg-[var(--portal-color-primary)] hover:text-white px-4 py-2.5 text-xs font-semibold text-[var(--portal-color-text)] border border-[var(--portal-color-border)]/50 transition-all shadow-2xs cursor-pointer"
            >
              {copiedType === 'markdown' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{t('copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t('copyMarkdown')}</span>
                </>
              )}
            </button>

          </div>
        </div>
      </section>
    </div>
  );
}
