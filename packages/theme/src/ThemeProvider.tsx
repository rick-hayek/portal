'use client';

import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import type { ThemeConfig } from '@portal/shared';
import { themes } from './themes';

const STORAGE_KEY = 'portal-theme';

export interface ThemeContextValue {
    /** Current active theme config */
    theme: ThemeConfig;
    /** Current theme id */
    themeId: string;
    /** Switch to a different theme by id */
    setTheme: (id: string) => void;
    /** All available themes */
    themes: Record<string, ThemeConfig>;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Resolve initial theme: localStorage → prefers-color-scheme → fallback */
function resolveInitialTheme(
    defaultThemeId: string,
    availableThemes: string[],
): string {
    if (typeof window === 'undefined') return defaultThemeId;

    // 1. Check localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && themes[saved] && availableThemes.includes(saved)) {
        return saved;
    }

    // 2. Check prefers-color-scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        const darkTheme = availableThemes.find((id) => themes[id]?.mode === 'dark');
        if (darkTheme) return darkTheme;
    }

    // 3. Fallback
    return defaultThemeId;
}

/** Inject theme tokens as CSS custom properties on :root */
function applyThemeToDOM(theme: ThemeConfig): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Colors
    for (const [key, value] of Object.entries(theme.colors)) {
        root.style.setProperty(`--portal-color-${camelToKebab(key)}`, value);
    }

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

    // Set data attribute for CSS selectors
    root.setAttribute('data-theme', theme.id);
    root.setAttribute('data-theme-mode', theme.mode);
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
    const available = useMemo(
        () => availableThemes ?? Object.keys(themes),
        [availableThemes],
    );

    const [themeId, setThemeId] = useState(() =>
        resolveInitialTheme(defaultTheme, available),
    );

    const theme = useMemo(
        () => themes[themeId] ?? themes[defaultTheme] ?? Object.values(themes)[0]!,
        [themeId, defaultTheme],
    );

    // Apply theme tokens to DOM
    useEffect(() => {
        applyThemeToDOM(theme);
    }, [theme]);

    const setTheme = useCallback(
        (id: string) => {
            if (!themes[id] || !available.includes(id)) return;
            setThemeId(id);
            localStorage.setItem(STORAGE_KEY, id);
        },
        [available],
    );

    const value = useMemo<ThemeContextValue>(
        () => ({ theme, themeId, setTheme, themes }),
        [theme, themeId, setTheme],
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}
