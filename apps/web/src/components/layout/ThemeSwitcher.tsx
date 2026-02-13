'use client';

import { useTheme } from '@portal/theme';
import { themes } from '@portal/theme';

export function ThemeSwitcher() {
    const { themeId, setTheme } = useTheme();

    return (
        <div className="portal-theme-switcher relative">
            <select
                value={themeId}
                onChange={(e) => setTheme(e.target.value)}
                aria-label="Switch theme"
                className="appearance-none cursor-pointer rounded-md px-3 py-1.5 text-sm
          border border-[var(--portal-color-border)]
          bg-[var(--portal-color-surface)] text-[var(--portal-color-text)]
          transition-colors hover:border-[var(--portal-color-primary)]
          focus:outline-none focus:ring-2 focus:ring-[var(--portal-color-primary)]"
            >
                {Object.values(themes).map((t) => (
                    <option key={t.id} value={t.id}>
                        {t.mode === 'dark' ? '🌙' : '☀️'} {t.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
