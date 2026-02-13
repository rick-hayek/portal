import { describe, expect, it } from 'vitest';
import { themes } from '@portal/theme';
import type { ThemeConfig } from '@portal/shared';

// ============================================================
// @portal/theme — Theme Data and Engine Tests
// ============================================================

// ------ Complete list of required key for Theme Color Tokens ------
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

const REQUIRED_TYPOGRAPHY_KEYS: (keyof ThemeConfig['typography'])[] = [
    'fontFamily',
    'headingFont',
    'monoFont',
    'scale',
];

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

describe('@portal/theme — Theme Registration', () => {
    it('At least 2 themes are registered', () => {
        expect(Object.keys(themes).length).toBeGreaterThanOrEqual(2);
    });

    it('Contains minimal-light theme', () => {
        expect(themes['minimal-light']).toBeDefined();
    });

    it('Contains dark-neon theme', () => {
        expect(themes['dark-neon']).toBeDefined();
    });

    it('The id of each theme matches the key name', () => {
        for (const [key, theme] of Object.entries(themes)) {
            expect(theme.id).toBe(key);
        }
    });
});

describe('@portal/theme — Theme Token Integrity', () => {
    const themeEntries = Object.entries(themes);

    it.each(themeEntries)('%s — Contains all 10 color Tokens', (_id, theme) => {
        for (const key of REQUIRED_COLOR_KEYS) {
            expect(theme.colors[key], `Missing color Token: ${key}`).toBeDefined();
            expect(typeof theme.colors[key]).toBe('string');
        }
    });

    it.each(themeEntries)('%s — Color values are valid HEX format', (_id, theme) => {
        for (const [key, value] of Object.entries(theme.colors)) {
            expect(value, `${key} Invalid HEX: ${value}`).toMatch(HEX_COLOR_REGEX);
        }
    });

    it.each(themeEntries)('%s — Contains all typography Tokens', (_id, theme) => {
        for (const key of REQUIRED_TYPOGRAPHY_KEYS) {
            expect(theme.typography[key], `Missing typography Token: ${key}`).toBeDefined();
        }
    });

    it.each(themeEntries)('%s — typography.scale is positive', (_id, theme) => {
        expect(theme.typography.scale).toBeGreaterThan(0);
    });

    it.each(themeEntries)('%s — spacing.unit is a positive integer', (_id, theme) => {
        expect(theme.spacing.unit).toBeGreaterThan(0);
        expect(Number.isInteger(theme.spacing.unit)).toBe(true);
    });

    it.each(themeEntries)('%s — spacing.radius is a non-empty string', (_id, theme) => {
        expect(theme.spacing.radius.length).toBeGreaterThan(0);
    });

    it.each(themeEntries)('%s — effects are complete', (_id, theme) => {
        expect(theme.effects.shadow).toBeDefined();
        expect(theme.effects.blur).toBeDefined();
        expect(theme.effects.transition).toBeDefined();
    });
});

describe('@portal/theme — Theme Semantic Consistency', () => {
    it('minimal-light is light mode', () => {
        expect(themes['minimal-light']?.mode).toBe('light');
    });

    it('dark-neon is dark mode', () => {
        expect(themes['dark-neon']?.mode).toBe('dark');
    });

    it('light theme background should be light (brightness > 200)', () => {
        const light = themes['minimal-light']!;
        const brightness = hexBrightness(light.colors.background);
        expect(brightness, `background ${light.colors.background} brightness ${brightness} should be > 200`).toBeGreaterThan(200);
    });

    it('dark theme background should be dark (brightness < 80)', () => {
        const dark = themes['dark-neon']!;
        const brightness = hexBrightness(dark.colors.background);
        expect(brightness, `background ${dark.colors.background} brightness ${brightness} should be < 80`).toBeLessThan(80);
    });

    it('text to background contrast is sufficient (WCAG AA)', () => {
        for (const [id, theme] of Object.entries(themes)) {
            const contrast = contrastRatio(theme.colors.text, theme.colors.background);
            expect(
                contrast,
                `${id}: text/background contrast ${contrast.toFixed(2)} should be >= 4.5`,
            ).toBeGreaterThanOrEqual(4.5);
        }
    });

    it('Each theme has a unique name', () => {
        const names = Object.values(themes).map((t) => t.name);
        expect(new Set(names).size).toBe(names.length);
    });
});

// ------ Utility Functions ------

/** Convert HEX color to RGB components */
function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    return [
        Number.parseInt(full.slice(0, 2), 16),
        Number.parseInt(full.slice(2, 4), 16),
        Number.parseInt(full.slice(4, 6), 16),
    ];
}

/** Calculate perceived brightness (0-255) */
function hexBrightness(hex: string): number {
    const [r, g, b] = hexToRgb(hex);
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Calculate WCAG relative luminance */
function luminance(hex: string): number {
    const [r, g, b] = hexToRgb(hex).map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Calculate WCAG contrast ratio */
function contrastRatio(hex1: string, hex2: string): number {
    const l1 = luminance(hex1);
    const l2 = luminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}
