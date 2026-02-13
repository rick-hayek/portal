import { describe, expect, it } from 'vitest';
import { themes } from '@portal/theme';
import type { ThemeConfig } from '@portal/shared';
import fs from 'node:fs';
import path from 'node:path';

// ============================================================
// @portal/theme — Theme Engine Tests (Phase 1)
// ============================================================

const ALL_THEME_IDS = [
    'minimal-light',
    'dark-neon',
    'cyberpunk',
    'nature-green',
    'retro-brown',
];

const REQUIRED_COLOR_KEYS: (keyof ThemeConfig['colors'])[] = [
    'primary',
    'secondary',
    'accent',
    'background',
    'surface',
    'text',
    'textSecondary',
    'border',
    'error',
    'success',
];

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

describe('Theme Engine — All 5 themes registered', () => {
    it('Exactly 5 themes exist', () => {
        expect(Object.keys(themes)).toHaveLength(5);
    });

    it.each(ALL_THEME_IDS)('Contains theme: %s', (id) => {
        expect(themes[id]).toBeDefined();
    });

    it.each(ALL_THEME_IDS)('%s — id matches key', (id) => {
        expect(themes[id]!.id).toBe(id);
    });

    it.each(ALL_THEME_IDS)('%s — has a non-empty name', (id) => {
        expect(themes[id]!.name.length).toBeGreaterThan(0);
    });

    it('Each theme has a unique name', () => {
        const names = Object.values(themes).map((t) => t.name);
        expect(new Set(names).size).toBe(names.length);
    });
});

describe('Theme Engine — Token completeness for all 5 themes', () => {
    const themeEntries = Object.entries(themes);

    it.each(themeEntries)('%s — has all 10 color tokens', (_id, theme) => {
        for (const key of REQUIRED_COLOR_KEYS) {
            expect(theme.colors[key], `Missing color: ${key}`).toBeDefined();
        }
    });

    it.each(themeEntries)('%s — all colors are valid HEX', (_id, theme) => {
        for (const [key, value] of Object.entries(theme.colors)) {
            expect(value, `${key}: ${value}`).toMatch(HEX_COLOR_REGEX);
        }
    });

    it.each(themeEntries)('%s — has typography tokens', (_id, theme) => {
        expect(theme.typography.fontFamily).toBeDefined();
        expect(theme.typography.headingFont).toBeDefined();
        expect(theme.typography.monoFont).toBeDefined();
        expect(theme.typography.scale).toBeGreaterThan(0);
    });

    it.each(themeEntries)('%s — has spacing tokens', (_id, theme) => {
        expect(theme.spacing.unit).toBeGreaterThan(0);
        expect(theme.spacing.radius.length).toBeGreaterThan(0);
    });

    it.each(themeEntries)('%s — has effects tokens', (_id, theme) => {
        expect(theme.effects.shadow).toBeDefined();
        expect(theme.effects.blur).toBeDefined();
        expect(theme.effects.transition).toBeDefined();
    });
});

describe('Theme Engine — Dark/Light mode consistency', () => {
    it('At least 1 light theme exists', () => {
        const lightThemes = Object.values(themes).filter((t) => t.mode === 'light');
        expect(lightThemes.length).toBeGreaterThanOrEqual(1);
    });

    it('At least 1 dark theme exists', () => {
        const darkThemes = Object.values(themes).filter((t) => t.mode === 'dark');
        expect(darkThemes.length).toBeGreaterThanOrEqual(1);
    });

    it('cyberpunk is dark mode', () => {
        expect(themes.cyberpunk?.mode).toBe('dark');
    });

    it('nature-green is light mode', () => {
        expect(themes['nature-green']?.mode).toBe('light');
    });

    it('retro-brown is light mode', () => {
        expect(themes['retro-brown']?.mode).toBe('light');
    });

    it('Light themes have bright backgrounds (brightness > 180)', () => {
        for (const theme of Object.values(themes)) {
            if (theme.mode === 'light') {
                const b = hexBrightness(theme.colors.background);
                expect(b, `${theme.id} background brightness`).toBeGreaterThan(180);
            }
        }
    });

    it('Dark themes have dark backgrounds (brightness < 80)', () => {
        for (const theme of Object.values(themes)) {
            if (theme.mode === 'dark') {
                const b = hexBrightness(theme.colors.background);
                expect(b, `${theme.id} background brightness`).toBeLessThan(80);
            }
        }
    });

    it('All themes have WCAG AA text contrast (>= 4.5)', () => {
        for (const theme of Object.values(themes)) {
            const cr = contrastRatio(theme.colors.text, theme.colors.background);
            expect(cr, `${theme.id} contrast`).toBeGreaterThanOrEqual(4.5);
        }
    });
});

describe('Theme Engine — ThemeProvider & useTheme exports', () => {
    it('ThemeProvider.tsx exists', () => {
        const p = path.resolve(__dirname, '../packages/theme/src/ThemeProvider.tsx');
        expect(fs.existsSync(p)).toBe(true);
    });

    it('useTheme.ts exists', () => {
        const p = path.resolve(__dirname, '../packages/theme/src/useTheme.ts');
        expect(fs.existsSync(p)).toBe(true);
    });

    it('ThemeProvider exports ThemeProvider function', () => {
        const content = fs.readFileSync(
            path.resolve(__dirname, '../packages/theme/src/ThemeProvider.tsx'),
            'utf-8',
        );
        expect(content).toContain('export function ThemeProvider');
    });

    it('ThemeProvider exports ThemeContext', () => {
        const content = fs.readFileSync(
            path.resolve(__dirname, '../packages/theme/src/ThemeProvider.tsx'),
            'utf-8',
        );
        expect(content).toContain('export const ThemeContext');
    });

    it('useTheme exports useTheme function', () => {
        const content = fs.readFileSync(
            path.resolve(__dirname, '../packages/theme/src/useTheme.ts'),
            'utf-8',
        );
        expect(content).toContain('export function useTheme');
    });

    it('ThemeProvider injects CSS custom properties', () => {
        const content = fs.readFileSync(
            path.resolve(__dirname, '../packages/theme/src/ThemeProvider.tsx'),
            'utf-8',
        );
        expect(content).toContain('setProperty');
        expect(content).toContain('--portal-');
    });

    it('ThemeProvider reads from localStorage', () => {
        const content = fs.readFileSync(
            path.resolve(__dirname, '../packages/theme/src/ThemeProvider.tsx'),
            'utf-8',
        );
        expect(content).toContain('localStorage');
        expect(content).toContain('portal-theme');
    });

    it('ThemeProvider respects prefers-color-scheme', () => {
        const content = fs.readFileSync(
            path.resolve(__dirname, '../packages/theme/src/ThemeProvider.tsx'),
            'utf-8',
        );
        expect(content).toContain('prefers-color-scheme');
    });

    it('index.ts re-exports ThemeProvider, useTheme, themes', () => {
        const content = fs.readFileSync(
            path.resolve(__dirname, '../packages/theme/src/index.ts'),
            'utf-8',
        );
        expect(content).toContain('ThemeProvider');
        expect(content).toContain('useTheme');
        expect(content).toContain('themes');
    });
});

// ------ Utility Functions ------

function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    return [
        Number.parseInt(full.slice(0, 2), 16),
        Number.parseInt(full.slice(2, 4), 16),
        Number.parseInt(full.slice(4, 6), 16),
    ];
}

function hexBrightness(hex: string): number {
    const [r, g, b] = hexToRgb(hex);
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

function luminance(hex: string): number {
    const [r, g, b] = hexToRgb(hex).map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
    const l1 = luminance(hex1);
    const l2 = luminance(hex2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
