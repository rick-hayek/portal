'use client';

import type { ThemeConfig } from '@portal/shared';
import { createContext, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { themes } from './themes';

const STORAGE_KEY = 'portal-theme';

export interface ThemeContextValue {
  /** Current active theme config */
  theme: ThemeConfig;
  /** Current theme setting id ('system' or specific theme id) */
  themeId: string;
  /** Resolved active theme id applied to DOM */
  resolvedThemeId: string;
  /** Switch to a different theme by id ('system' | 'minimal-light' | ...) */
  setTheme: (id: string) => void;
  /** All available themes */
  themes: Record<string, ThemeConfig>;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Inject theme tokens as CSS custom properties on :root */
function applyThemeToDOM(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Colors
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--portal-color-${camelToKebab(key)}`, value);
  }

  // Derived / convenience color tokens
  const primary = (theme.colors as any).primary as string | undefined;
  const background = (theme.colors as any).background as string | undefined;
  const border = (theme.colors as any).border as string | undefined;

  function hexToRgba(hex?: string, alpha = 1) {
    if (!hex) return undefined;
    const h = hex.replace('#', '');
    const bigint = parseInt(
      h.length === 3
        ? h
            .split('')
            .map((c) => c + c)
            .join('')
        : h,
      16,
    );
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // primary-soft: gentle translucent variant of primary color
  const primarySoft = (theme.colors as any).primarySoft ?? hexToRgba(primary, 0.08);
  if (primarySoft) root.style.setProperty('--portal-color-primary-soft', primarySoft);

  // border-soft: fallback to border color if specialized token not provided
  const borderSoft = (theme.colors as any).borderSoft ?? border;
  if (borderSoft) root.style.setProperty('--portal-color-border-soft', borderSoft);

  // text-tertiary: fallback to textSecondary
  const textTertiary = (theme.colors as any).textTertiary ?? theme.colors.textSecondary;
  if (textTertiary) root.style.setProperty('--portal-color-text-tertiary', textTertiary);

  // surface-alt: fallback to surface
  const surfaceAlt = (theme.colors as any).surfaceAlt ?? theme.colors.surface;
  if (surfaceAlt) root.style.setProperty('--portal-color-surface-alt', surfaceAlt);

  // background-glass: translucent variant of background for glass headers
  const backgroundGlass = (theme.colors as any).backgroundGlass ?? hexToRgba(background, 0.72);
  if (backgroundGlass) root.style.setProperty('--portal-color-background-glass', backgroundGlass);

  // Typography
  root.style.setProperty('--portal-font-family', theme.typography.fontFamily);
  root.style.setProperty('--portal-font-heading', theme.typography.headingFont);
  root.style.setProperty('--portal-font-mono', theme.typography.monoFont);
  root.style.setProperty('--portal-font-scale', String(theme.typography.scale));

  // Spacing
  root.style.setProperty('--portal-spacing-unit', `${theme.spacing.unit}px`);
  root.style.setProperty('--portal-radius', theme.spacing.radius);

  // Effects
  root.style.setProperty('--portal-shadow', theme.effects.shadow);
  root.style.setProperty('--portal-blur', theme.effects.blur);
  root.style.setProperty('--portal-transition', theme.effects.transition);

  // Set data attributes and class for CSS selectors
  root.setAttribute('data-theme', theme.id);
  root.setAttribute('data-theme-mode', theme.mode);
  root.classList.toggle('dark', theme.mode === 'dark');
}

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** Default theme id to use (from site config) */
  defaultTheme?: string;
  /** List of available theme ids (from site config) */
  availableThemes?: string[];
}

export function ThemeProvider({
  children,
  defaultTheme = 'minimal-light',
  availableThemes,
}: ThemeProviderProps) {
  const available = useMemo(() => availableThemes ?? Object.keys(themes), [availableThemes]);

  // Initial state is consistently 'system' on both server and client hydration to prevent hydration mismatch
  const [themeId, setThemeId] = useState('system');

  // Read saved theme from localStorage post-hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === 'system' || (themes[saved] && available.includes(saved)))) {
      setThemeId(saved);
    }
  }, [available]);

  // Listen to system prefers-color-scheme changes
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedThemeId = useMemo(() => {
    if (themeId === 'system') {
      if (systemPrefersDark) {
        const darkTheme = available.find((id) => themes[id]?.mode === 'dark');
        if (darkTheme) return darkTheme;
      }
      const lightTheme = available.find((id) => themes[id]?.mode === 'light');
      return lightTheme ?? defaultTheme;
    }
    return themes[themeId] && available.includes(themeId) ? themeId : defaultTheme;
  }, [themeId, systemPrefersDark, available, defaultTheme]);

  const theme = useMemo(
    () => themes[resolvedThemeId] ?? themes[defaultTheme] ?? Object.values(themes)[0]!,
    [resolvedThemeId, defaultTheme],
  );

  // Apply theme tokens to DOM
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const setTheme = useCallback(
    (id: string) => {
      if (id !== 'system' && (!themes[id] || !available.includes(id))) return;
      setThemeId(id);
      localStorage.setItem(STORAGE_KEY, id);
    },
    [available],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, themeId, resolvedThemeId, setTheme, themes }),
    [theme, themeId, resolvedThemeId, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
