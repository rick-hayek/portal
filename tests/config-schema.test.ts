import { describe, expect, it, beforeEach } from 'vitest';
import {
    defineConfig,
    siteConfigSchema,
    applyPreset,
    getPresetModules,
    registerModule,
    getEnabledModules,
    getNavItems,
    clearRegistry,
    type PresetName,
} from '@portal/config';
import type { SiteConfig, SiteModule } from '@portal/shared';

// ============================================================
// @portal/config — Config Schema & Module Registry Tests (Phase 1)
// ============================================================

// Helper: minimal valid SiteConfig input
const VALID_INPUT = {
    site: {
        title: 'Test Portal',
        description: 'Testing',
        url: 'https://example.com',
        locale: 'en-US',
    },
    preset: 'tech-blog' as const,
    modules: {},
    theme: {
        default: 'minimal-light',
        available: ['minimal-light', 'dark-neon'],
        allowUserSwitch: true,
    },
    admin: { enabled: false, basePath: '/admin' },
};

describe('Config Schema — Zod validation', () => {
    it('Parses a fully valid config', () => {
        const result = siteConfigSchema.safeParse(VALID_INPUT);
        expect(result.success).toBe(true);
    });

    it('Rejects if site.title is empty', () => {
        const result = siteConfigSchema.safeParse({
            ...VALID_INPUT,
            site: { ...VALID_INPUT.site, title: '' },
        });
        expect(result.success).toBe(false);
    });

    it('Rejects if site.url is not a valid URL', () => {
        const result = siteConfigSchema.safeParse({
            ...VALID_INPUT,
            site: { ...VALID_INPUT.site, url: 'not-a-url' },
        });
        expect(result.success).toBe(false);
    });

    it('Applies default theme settings when theme is omitted', () => {
        const { theme: _, ...withoutTheme } = VALID_INPUT;
        const result = siteConfigSchema.parse(withoutTheme);
        expect(result.theme.default).toBe('minimal-light');
        expect(result.theme.allowUserSwitch).toBe(true);
        expect(result.theme.available).toHaveLength(5);
    });

    it('Applies default admin settings when admin is omitted', () => {
        const { admin: _, ...withoutAdmin } = VALID_INPUT;
        const result = siteConfigSchema.parse(withoutAdmin);
        expect(result.admin.enabled).toBe(false);
        expect(result.admin.basePath).toBe('/admin');
    });

    it('Preserves preset field', () => {
        const result = siteConfigSchema.parse(VALID_INPUT);
        expect(result.preset).toBe('tech-blog');
    });

    it('Allows modules to have extra fields (passthrough)', () => {
        const input = {
            ...VALID_INPUT,
            modules: { blog: { enabled: true, postsPerPage: 10 } },
        };
        const result = siteConfigSchema.parse(input);
        expect((result.modules.blog as Record<string, unknown>).postsPerPage).toBe(10);
    });
});

describe('Config Schema — defineConfig integration', () => {
    it('defineConfig returns a valid SiteConfig', () => {
        const config = defineConfig(VALID_INPUT);
        expect(config.site.title).toBe('Test Portal');
        expect(config.theme.default).toBe('minimal-light');
    });

    it('defineConfig merges preset modules', () => {
        const config = defineConfig({
            site: VALID_INPUT.site,
            preset: 'minimal',
        });
        // minimal preset enables about + links
        expect(config.modules.about).toEqual({ enabled: true });
        expect(config.modules.links).toEqual({ enabled: true });
    });

    it('User module overrides take precedence over preset', () => {
        const config = defineConfig({
            site: VALID_INPUT.site,
            preset: 'tech-blog',
            modules: { blog: { enabled: false } },
        });
        // User explicitly disabled blog, overriding preset
        expect(config.modules.blog).toEqual({ enabled: false });
    });
});

describe('Config Presets — 5 presets', () => {
    const PRESETS: PresetName[] = [
        'minimal',
        'tech-blog',
        'creative',
        'full',
        'devtools',
    ];

    it.each(PRESETS)('Preset "%s" returns non-empty modules', (preset) => {
        const modules = getPresetModules(preset);
        expect(Object.keys(modules).length).toBeGreaterThan(0);
    });

    it('minimal enables exactly 2 modules (about, links)', () => {
        const modules = getPresetModules('minimal');
        expect(Object.keys(modules)).toHaveLength(2);
        expect(modules.about).toEqual({ enabled: true });
        expect(modules.links).toEqual({ enabled: true });
    });

    it('tech-blog enables blog, about, search, analytics, links', () => {
        const modules = getPresetModules('tech-blog');
        expect(modules.blog).toEqual({ enabled: true });
        expect(modules.about).toEqual({ enabled: true });
        expect(modules.search).toEqual({ enabled: true });
        expect(modules.analytics).toEqual({ enabled: true });
        expect(modules.links).toEqual({ enabled: true });
    });

    it('full enables the most modules (>= 8)', () => {
        const modules = getPresetModules('full');
        expect(Object.keys(modules).length).toBeGreaterThanOrEqual(8);
    });

    it.each(PRESETS)('defineConfig with preset "%s" produces valid config', (preset) => {
        const config = defineConfig({
            site: VALID_INPUT.site,
            preset,
        });
        expect(config.site.title).toBe('Test Portal');
        expect(Object.keys(config.modules).length).toBeGreaterThan(0);
    });
});

describe('Module Registry — register, query, nav', () => {
    const mockBlog: SiteModule = {
        id: 'blog',
        name: 'Blog',
        icon: '📝',
        version: '1.0.0',
        routes: [{ path: '/blog', label: 'Blog' }],
        navItems: [{ label: 'Blog', href: '/blog', icon: '📝', order: 1 }],
    };

    const mockAbout: SiteModule = {
        id: 'about',
        name: 'About',
        icon: '👤',
        version: '1.0.0',
        routes: [{ path: '/about', label: 'About' }],
        navItems: [{ label: 'About', href: '/about', icon: '👤', order: 2 }],
    };

    const mockConfig: SiteConfig = {
        site: { title: 'Test', description: '', url: 'https://test.com', locale: 'en-US' },
        modules: {
            blog: { enabled: true },
            about: { enabled: true },
            gallery: { enabled: false },
        },
        theme: { default: 'minimal-light', available: [], allowUserSwitch: true },
        admin: { enabled: false, basePath: '/admin' },
    };

    beforeEach(() => {
        clearRegistry();
    });

    it('registerModule + getEnabledModules works', () => {
        registerModule(mockBlog);
        registerModule(mockAbout);
        const enabled = getEnabledModules(mockConfig);
        expect(enabled).toHaveLength(2);
        expect(enabled.map((m) => m.id)).toContain('blog');
        expect(enabled.map((m) => m.id)).toContain('about');
    });

    it('Disabled modules are excluded', () => {
        const gallery: SiteModule = {
            id: 'gallery',
            name: 'Gallery',
            icon: '🖼️',
            version: '1.0.0',
            routes: [{ path: '/gallery', label: 'Gallery' }],
        };
        registerModule(gallery);
        const enabled = getEnabledModules(mockConfig);
        expect(enabled.map((m) => m.id)).not.toContain('gallery');
    });

    it('getNavItems returns sorted items', () => {
        registerModule(mockAbout); // order 2
        registerModule(mockBlog);  // order 1
        const items = getNavItems(mockConfig);
        expect(items).toHaveLength(2);
        expect(items[0]!.label).toBe('Blog');  // order 1 first
        expect(items[1]!.label).toBe('About'); // order 2 second
    });

    it('getNavItems returns empty array when no modules registered', () => {
        const items = getNavItems(mockConfig);
        expect(items).toHaveLength(0);
    });

    it('clearRegistry removes all modules', () => {
        registerModule(mockBlog);
        clearRegistry();
        const enabled = getEnabledModules(mockConfig);
        expect(enabled).toHaveLength(0);
    });
});
