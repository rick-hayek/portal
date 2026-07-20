'use client';

import { Dropdown, DropdownOption } from '@/components/ui/Dropdown';
import { themes, useTheme } from '@portal/theme';

export function ThemeSwitcher({ iconOnly = false }: { iconOnly?: boolean }) {
  const { themeId, setTheme } = useTheme();

  const themeOptions: DropdownOption[] = Object.values(themes).map((t) => ({
    value: t.id,
    label: t.name,
    icon: (
      <span>
        {
          {
            'minimal-light': '⚪',
            'dark-neon': '⚡',
            cyberpunk: '👾',
            'nature-green': '🌿',
            'retro-brown': '☕',
          }[t.id] || (t.mode === 'dark' ? '🌙' : '☀️')
        }
      </span>
    ),
  }));

  const currentTheme = themes[themeId as keyof typeof themes];
  const activeIcon = currentTheme
    ? {
        'minimal-light': '⚪',
        'dark-neon': '⚡',
        cyberpunk: '👾',
        'nature-green': '🌿',
        'retro-brown': '☕',
      }[currentTheme.id] || (currentTheme.mode === 'dark' ? '🌙' : '☀️')
    : '☀️';

  if (iconOnly) {
    return (
      <Dropdown
        value={themeId}
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
            {activeIcon}
          </button>
        )}
      />
    );
  }

  return (
    <div className="portal-theme-switcher w-40">
      <Dropdown
        value={themeId}
        onChange={(val) => setTheme(val as any)}
        options={themeOptions}
        align="right"
        menuClassName="w-48"
      />
    </div>
  );
}
