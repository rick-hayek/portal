'use client';

import { themes, useTheme } from '@portal/theme';

export function ThemeSwitcher({ iconOnly = false }: { iconOnly?: boolean }) {
  const { themeId, setTheme } = useTheme();

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
      <div className="portal-theme-switcher relative h-9 w-9 flex items-center justify-center">
        {/* Visual Button */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-compat bg-[var(--portal-color-surface)] text-sm text-[var(--portal-color-text)] transition-colors hover:border-[var(--portal-color-primary)]">
          {activeIcon}
        </div>
        {/* Native Select (invisible but clickable on top) */}
        <select
          value={themeId}
          onChange={(e) => setTheme(e.target.value)}
          aria-label="Switch theme"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        >
          {Object.values(themes).map((t) => {
            const icon =
              {
                'minimal-light': '⚪',
                'dark-neon': '⚡',
                cyberpunk: '👾',
                'nature-green': '🌿',
                'retro-brown': '☕',
              }[t.id] || (t.mode === 'dark' ? '🌙' : '☀️');

            return (
              <option key={t.id} value={t.id}>
                {icon} {t.name}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  return (
    <div className="portal-theme-switcher relative">
      <select
        value={themeId}
        onChange={(e) => setTheme(e.target.value)}
        aria-label="Switch theme"
        className="appearance-none cursor-pointer rounded-md px-3 py-2.5 md:py-1.5 text-sm
          border border-compat
          bg-[var(--portal-color-surface)] text-[var(--portal-color-text)]
          transition-colors hover-border-compat-primary
          focus:outline-none focus:ring-2 focus:ring-[var(--portal-color-primary)]"
      >
        {Object.values(themes).map((t) => {
          const icon =
            {
              'minimal-light': '⚪',
              'dark-neon': '⚡',
              cyberpunk: '👾',
              'nature-green': '🌿',
              'retro-brown': '☕',
            }[t.id] || (t.mode === 'dark' ? '🌙' : '☀️');

          return (
            <option key={t.id} value={t.id}>
              {icon} {t.name}
            </option>
          );
        })}
      </select>
    </div>
  );
}
