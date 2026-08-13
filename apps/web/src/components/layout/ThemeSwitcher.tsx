'use client';

import { themes, useTheme } from '@portal/theme';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown';
import siteConfig from '@/site.config';

export function ThemeSwitcher({
  iconOnly = false,
  responsive = false,
  onItemClick,
}: {
  iconOnly?: boolean;
  responsive?: boolean;
  onItemClick?: () => void;
}) {
  const t = useTranslations('Themes');
  const { themeId, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isMetro = siteConfig.homeLayout === 'metro';

  useEffect(() => {
    setMounted(true);
    if (isMetro) {
      setTheme('dark-neon' as any);
      document.documentElement.classList.add('dark');
    }
  }, [isMetro, setTheme]);

  if (isMetro) {
    return null;
  }

  const getThemeLabel = (id: string, fallbackName: string) => {
    try {
      if (t.has(id as any)) {
        return t(id as any);
      }
    } catch {
      // Fallback
    }
    return fallbackName;
  };

  const themeOptions: DropdownOption[] = [
    {
      value: 'system',
      label: getThemeLabel('system', 'System (Auto)'),
      icon: <span>💻</span>,
    },
    ...Object.values(themes).map((themeItem) => ({
      value: themeItem.id,
      label: getThemeLabel(themeItem.id, themeItem.name),
      icon: (
        <span>
          {{
            'minimal-light': '⚪',
            'dark-neon': '⚡',
            cyberpunk: '👾',
            'retro-brown': '☕',
            zenith: '🧘',
            lumiere: '✨',
          }[themeItem.id] || (themeItem.mode === 'dark' ? '🌙' : '☀️')}
        </span>
      ),
    })),
  ];

  const displayThemeId = mounted ? themeId : 'system';
  const currentTheme = themes[displayThemeId as keyof typeof themes];
  const activeIcon =
    displayThemeId === 'system'
      ? '💻'
      : currentTheme
        ? {
            'minimal-light': '⚪',
            'dark-neon': '⚡',
            cyberpunk: '👾',
            'retro-brown': '☕',
            zenith: '🧘',
            lumiere: '✨',
          }[currentTheme.id] || (currentTheme.mode === 'dark' ? '🌙' : '☀️')
        : '💻';

  const handleChange = (val: string) => {
    setTheme(val as any);
    onItemClick?.();
  };

  if (responsive) {
    return (
      <>
        {/* Mobile: Icon Circle */}
        <div className="md:hidden">
          <Dropdown
            value={displayThemeId}
            onChange={handleChange}
            options={themeOptions}
            align="right"
            menuClassName="w-48"
            renderTrigger={() => (
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--portal-color-border,#e5e7eb)] bg-[var(--portal-color-surface)] text-sm text-[var(--portal-color-text)] transition-colors hover:border-[var(--portal-color-primary)] cursor-pointer focus:outline-none"
                aria-label="Switch theme"
              >
                <span suppressHydrationWarning>{activeIcon}</span>
              </button>
            )}
          />
        </div>
        {/* Desktop / Medium: Full Dropdown */}
        <div className="hidden md:block portal-theme-switcher w-44">
          <Dropdown
            value={displayThemeId}
            onChange={handleChange}
            options={themeOptions}
            align="right"
            menuClassName="w-48"
          />
        </div>
      </>
    );
  }

  if (iconOnly) {
    return (
      <Dropdown
        value={displayThemeId}
        onChange={handleChange}
        options={themeOptions}
        align="right"
        menuClassName="w-48"
        renderTrigger={() => (
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--portal-color-border,#e5e7eb)] bg-[var(--portal-color-surface)] text-sm text-[var(--portal-color-text)] transition-colors hover:border-[var(--portal-color-primary)] cursor-pointer focus:outline-none"
            aria-label="Switch theme"
          >
            <span suppressHydrationWarning>{activeIcon}</span>
          </button>
        )}
      />
    );
  }

  return (
    <div className="portal-theme-switcher w-44">
      <Dropdown
        value={displayThemeId}
        onChange={handleChange}
        options={themeOptions}
        align="right"
        menuClassName="w-48"
      />
    </div>
  );
}
