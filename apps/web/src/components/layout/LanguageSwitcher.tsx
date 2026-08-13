'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';

export function LanguageSwitcher({ onItemClick }: { onItemClick?: () => void }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    onItemClick?.();
    const nextLocale = locale === 'en' ? 'zh' : 'en';
    // Explicitly update NEXT_LOCALE cookie for root path to synchronize Middleware & SSR
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  const currentLabel = locale === 'zh' ? '中文简体' : 'English';
  const targetLabel = locale === 'en' ? '中文简体' : 'English';

  return (
    <button
      type="button"
      onClick={toggleLocale}
      disabled={isPending}
      className="flex h-9 items-center justify-center rounded-full border border-[var(--portal-color-border,#e5e7eb)] bg-[var(--portal-color-surface)] px-3.5 text-xs font-semibold whitespace-nowrap shrink-0 text-[var(--portal-color-text-secondary)] transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-text)] disabled:opacity-50 cursor-pointer"
      title={`Switch to ${targetLabel}`}
      aria-label={`Switch to ${targetLabel}`}
    >
      <span className="whitespace-nowrap">{currentLabel}</span>
    </button>
  );
}
