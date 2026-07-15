'use client';

import { themes, useTheme } from '@portal/theme';
import { useEffect, useState } from 'react';

export function ThemeSwitcher({ iconOnly = false }: { iconOnly?: boolean }) {
  const { themeId, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const closeMenu = () => setIsOpen(false);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [isOpen]);

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

  return (
    <div className="portal-theme-switcher relative">
      {iconOnly ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-compat bg-[var(--portal-color-surface)] text-sm text-[var(--portal-color-text)] transition-colors hover:border-[var(--portal-color-primary)] cursor-pointer focus:outline-none"
          aria-label="Switch theme"
        >
          {activeIcon}
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="flex items-center justify-between gap-2 cursor-pointer rounded-md px-3 py-2.5 md:py-1.5 text-sm
            border border-compat
            bg-[var(--portal-color-surface)] text-[var(--portal-color-text)]
            transition-colors hover-border-compat-primary
            focus:outline-none focus:ring-2 focus:ring-[var(--portal-color-primary)]"
          aria-label="Switch theme"
        >
          <span className="flex items-center gap-1.5">
            <span>{activeIcon}</span>
            <span className="font-[500]">{currentTheme?.name || 'Theme'}</span>
          </span>
          <svg
            className={`h-3 w-3 text-[var(--portal-color-text-secondary)] transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <title>Dropdown arrow</title>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-48 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]/95 backdrop-blur-md py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
          {Object.values(themes).map((t) => {
            const icon =
              {
                'minimal-light': '⚪',
                'dark-neon': '⚡',
                cyberpunk: '👾',
                'nature-green': '🌿',
                'retro-brown': '☕',
              }[t.id] || (t.mode === 'dark' ? '🌙' : '☀️');
            const isActive = t.id === themeId;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[var(--portal-color-surface-alt)] font-semibold text-[var(--portal-color-primary)]'
                    : 'text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-surface-alt)] hover:text-[var(--portal-color-text)]'
                }`}
              >
                <span className="w-5 text-center shrink-0 mr-1 text-[10px] font-bold">
                  {isActive && '✓'}
                </span>
                <span className="mr-2 text-sm shrink-0">{icon}</span>
                <span className="truncate">{t.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
