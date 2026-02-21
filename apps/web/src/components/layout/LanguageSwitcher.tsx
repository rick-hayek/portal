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
            className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--portal-color-text-secondary)] transition-colors hover:bg-[var(--portal-color-background)] hover:text-[var(--portal-color-text)]"
            title={`Switch to ${locale === 'en' ? 'Chinese' : 'English'}`}
        >
            <span className="font-mono text-xs font-bold uppercase">{locale}</span>
        </button>
    );
}
