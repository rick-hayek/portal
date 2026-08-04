'use client';

import { themes, useTheme } from '@portal/theme';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown';

export function ThemeSwitcher({ iconOnly = false }: { iconOnly?: boolean }) {
  const t = useTranslations('Themes');
  const { themeId, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (iconOnly) {
    return (
      <Dropdown
        value={displayThemeId}
        onChange={(val) => setTheme(val as any)}
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
        onChange={(val) => setTheme(val as any)}
        options={themeOptions}
        align="right"
        menuClassName="w-48"
      />
    </div>
  );
}
