import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ============================================================
// Layout System — Component Structure Tests (Phase 1)
// ============================================================

const WEB_SRC = path.resolve(__dirname, '../apps/web/src');

describe('Layout — Component files exist', () => {
    const COMPONENTS = [
        'components/layout/Header.tsx',
        'components/layout/Footer.tsx',
        'components/layout/ThemeSwitcher.tsx',
    ];

    it.each(COMPONENTS)('%s exists', (file) => {
        expect(fs.existsSync(path.join(WEB_SRC, file))).toBe(true);
    });
});

describe('Layout — Site layout exists', () => {
    it('(site)/layout.tsx exists', () => {
        expect(fs.existsSync(path.join(WEB_SRC, 'app/(site)/layout.tsx'))).toBe(true);
    });

    it('(site)/page.tsx exists', () => {
        expect(fs.existsSync(path.join(WEB_SRC, 'app/(site)/page.tsx'))).toBe(true);
    });

    it('site.config.ts exists', () => {
        expect(fs.existsSync(path.join(WEB_SRC, 'site.config.ts'))).toBe(true);
    });
});

describe('Layout — Header component structure', () => {
    const headerPath = path.join(WEB_SRC, 'components/layout/Header.tsx');
    const content = fs.readFileSync(headerPath, 'utf-8');

    it('Is a client component', () => {
        expect(content).toContain("'use client'");
    });

    it('Exports Header function', () => {
        expect(content).toContain('export function Header');
    });

    it('Accepts siteTitle prop', () => {
        expect(content).toContain('siteTitle');
    });

    it('Accepts navItems prop', () => {
        expect(content).toContain('navItems');
    });

    it('Contains mobile menu toggle', () => {
        expect(content).toContain('mobileOpen');
    });

    it('Has desktop nav hidden on mobile (md:flex)', () => {
        expect(content).toContain('md:flex');
    });

    it('Has mobile menu hidden on desktop (md:hidden)', () => {
        expect(content).toContain('md:hidden');
    });

    it('Contains accessibility aria-label', () => {
        expect(content).toContain('aria-label');
    });
});

describe('Layout — Footer component structure', () => {
    const footerPath = path.join(WEB_SRC, 'components/layout/Footer.tsx');
    const content = fs.readFileSync(footerPath, 'utf-8');

    it('Exports Footer function', () => {
        expect(content).toContain('export function Footer');
    });

    it('Contains copyright symbol', () => {
        expect(content).toContain('&copy;');
    });

    it('Contains dynamic year', () => {
        expect(content).toContain('getFullYear');
    });

    it('Supports socialLinks prop', () => {
        expect(content).toContain('socialLinks');
    });
});

describe('Layout — ThemeSwitcher component structure', () => {
    const switcherPath = path.join(WEB_SRC, 'components/layout/ThemeSwitcher.tsx');
    const content = fs.readFileSync(switcherPath, 'utf-8');

    it('Is a client component', () => {
        expect(content).toContain("'use client'");
    });

    it('Exports ThemeSwitcher function', () => {
        expect(content).toContain('export function ThemeSwitcher');
    });

    it('Uses useTheme hook', () => {
        expect(content).toContain('useTheme');
    });

    it('Contains select element for theme switching', () => {
        expect(content).toContain('select');
    });

    it('Contains aria-label for accessibility', () => {
        expect(content).toContain('aria-label');
    });
});

describe('Layout — (site)/layout.tsx structure', () => {
    const layoutPath = path.join(WEB_SRC, 'app/(site)/layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');

    it('Uses ThemeProvider', () => {
        expect(content).toContain('ThemeProvider');
    });

    it('Uses Header component', () => {
        expect(content).toContain('Header');
    });

    it('Uses Footer component', () => {
        expect(content).toContain('Footer');
    });

    it('Imports siteConfig', () => {
        expect(content).toContain('siteConfig');
    });

    it('Passes theme config to ThemeProvider', () => {
        expect(content).toContain('defaultTheme');
        expect(content).toContain('availableThemes');
    });
});

describe('Layout — globals.css', () => {
    const cssPath = path.join(WEB_SRC, 'app/globals.css');
    const content = fs.readFileSync(cssPath, 'utf-8');

    it('Imports tailwindcss', () => {
        expect(content).toContain('@import "tailwindcss"');
    });

    it('Uses @theme inline directive', () => {
        expect(content).toContain('@theme inline');
    });

    it('Maps portal CSS variables to Tailwind tokens', () => {
        expect(content).toContain('--portal-color-background');
        expect(content).toContain('--portal-color-primary');
        expect(content).toContain('--portal-color-text');
    });

    it('Has smooth theme transition', () => {
        expect(content).toContain('transition');
        expect(content).toContain('--portal-transition');
    });
});
