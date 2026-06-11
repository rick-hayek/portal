'use client';

import { themes, useTheme } from '@portal/theme';

export function ThemeSwitcher() {
  const { themeId, setTheme } = useTheme();

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
