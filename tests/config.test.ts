import { describe, expect, it } from 'vitest';
import { defineConfig } from '@portal/config';
import type { SiteConfig } from '@portal/shared';

// ============================================================
// @portal/config — Configuration System Tests
// ============================================================

const validConfig: SiteConfig = {
    site: {
        title: 'Test Portal',
        description: 'Test Site',
        url: 'https://example.com',
        locale: 'en-US',
    },
    modules: {
        blog: { enabled: true },
        about: { enabled: true },
    },
    theme: {
        default: 'minimal-light',
        available: ['minimal-light', 'dark-neon'],
        allowUserSwitch: true,
    },
    admin: {
        enabled: true,
        basePath: '/admin',
    },
};

describe('@portal/config — defineConfig()', () => {
    it('Pass full config → Return as is', () => {
        const result = defineConfig(validConfig);
        expect(result).toEqual(validConfig);
        expect(result).toStrictEqual(validConfig);
    });

    it('Return value is deeply equal to input', () => {
        const result = defineConfig(validConfig);
        expect(result).toStrictEqual(validConfig);
    });

    it('Config with preset matches correctly passed', () => {
        const configWithPreset: SiteConfig = {
            ...validConfig,
            preset: 'tech-blog',
        };
        const result = defineConfig(configWithPreset);
        expect(result.preset).toBe('tech-blog');
    });

    it('Config without preset is also correctly passed', () => {
        const result = defineConfig(validConfig);
        expect(result.preset).toBeUndefined();
    });

    it('Module config supports custom fields', () => {
        const configWithModuleOptions: SiteConfig = {
            ...validConfig,
            modules: {
                blog: { enabled: true, postsPerPage: 10, showComments: true },
                gallery: { enabled: false },
            },
        };
        const result = defineConfig(configWithModuleOptions);
        expect(result.modules.blog?.enabled).toBe(true);
        expect(result.modules.blog?.['postsPerPage']).toBe(10);
        expect(result.modules.gallery?.enabled).toBe(false);
    });

    it('basePath is retained when admin is disabled', () => {
        const configAdminOff: SiteConfig = {
            ...validConfig,
            admin: { enabled: false, basePath: '/admin' },
        };
        const result = defineConfig(configAdminOff);
        expect(result.admin.enabled).toBe(false);
        expect(result.admin.basePath).toBe('/admin');
    });

    it('Supports multiple available themes', () => {
        const configMultiThemes: SiteConfig = {
            ...validConfig,
            theme: {
                default: 'dark-neon',
                available: ['minimal-light', 'dark-neon', 'cyberpunk', 'natural-green', 'retro-brown'],
                allowUserSwitch: true,
            },
        };
        const result = defineConfig(configMultiThemes);
        expect(result.theme.available).toHaveLength(5);
        expect(result.theme.default).toBe('dark-neon');
    });

    it('Default theme is retained when user switch is disabled', () => {
        const configNoSwitch: SiteConfig = {
            ...validConfig,
            theme: {
                ...validConfig.theme,
                allowUserSwitch: false,
            },
        };
        const result = defineConfig(configNoSwitch);
        expect(result.theme.allowUserSwitch).toBe(false);
        expect(result.theme.default).toBe('minimal-light');
    });

    it('Empty module list config is valid', () => {
        const configNoModules: SiteConfig = {
            ...validConfig,
            modules: {},
        };
        const result = defineConfig(configNoModules);
        expect(Object.keys(result.modules)).toHaveLength(0);
    });
});
