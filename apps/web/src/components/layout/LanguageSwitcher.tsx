'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'zh' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex h-11 w-11 md:h-9 md:w-auto md:px-3 items-center justify-center rounded-md text-[var(--portal-color-text-secondary)] transition-colors hover:bg-[var(--portal-color-background)] hover:text-[var(--portal-color-text)] cursor-pointer"
      title={`Switch to ${locale === 'en' ? '简体中文' : 'English'}`}
      aria-label={`Switch to ${locale === 'en' ? '简体中文' : 'English'}`}
    >
      {/* Mobile view */}
      <span className="font-mono text-xs font-bold uppercase md:hidden">{locale}</span>
      {/* Desktop view */}
      <span className="hidden md:inline text-xs font-bold">{locale === 'zh' ? '中文简体' : 'English'}</span>
    </button>
  );
}
