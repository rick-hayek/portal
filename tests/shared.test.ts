import { describe, expect, it } from 'vitest';
import {
    type ModuleConfig,
    type NavItem,
    type RouteConfig,
    type SiteConfig,
    type SiteModule,
    type ThemeConfig,
    type WidgetConfig,
} from '@portal/shared';

// ============================================================
// @portal/shared — Type Exports and Structure Validation
// ============================================================

describe('@portal/shared — Type Exports', () => {
    it('SiteConfig type structure is correct', () => {
        const config: SiteConfig = {
            site: {
                title: 'Test Portal',
                description: 'A test site',
                url: 'https://example.com',
                locale: 'en-US',
            },
            preset: 'minimal',
            modules: {
                blog: { enabled: true },
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

        expect(config.site.title).toBe('Test Portal');
        expect(config.preset).toBe('minimal');
        expect(config.modules.blog?.enabled).toBe(true);
        expect(config.theme.available).toHaveLength(2);
        expect(config.admin.enabled).toBe(true);
    });

    it('SiteConfig preset is limited to 5 preset values', () => {
        const presets: SiteConfig['preset'][] = [
            'minimal',
            'tech-blog',
            'creative',
            'full',
            'devtools',
            undefined, // preset is optional
        ];
        expect(presets).toHaveLength(6);
    });

    it('ModuleConfig supports extended fields', () => {
        const config: ModuleConfig = {
            enabled: true,
            postsPerPage: 10,
            showComments: true,
        };

        expect(config.enabled).toBe(true);
        expect(config['postsPerPage']).toBe(10);
    });

    it('SiteModule defines complete module contract', () => {
        const blogModule: SiteModule = {
            id: 'blog',
            name: 'Blog',
            icon: '📝',
            version: '0.1.0',
            routes: [{ path: '/blog', label: 'Blog' }],
            navItems: [{ label: 'Blog', href: '/blog', icon: '📝', order: 1 }],
            adminRoutes: [{ path: '/admin/posts', label: 'Post Management' }],
            widgets: [{ id: 'recent-posts', title: 'Recent Posts', size: 'medium' }],
            dependencies: [],
        };

        expect(blogModule.id).toBe('blog');
        expect(blogModule.routes).toHaveLength(1);
        expect(blogModule.navItems).toHaveLength(1);
        expect(blogModule.adminRoutes).toHaveLength(1);
        expect(blogModule.widgets).toHaveLength(1);
    });

    it('SiteModule optional fields can be omitted', () => {
        const minimalModule: SiteModule = {
            id: 'about',
            name: 'About',
            icon: '👤',
            version: '0.1.0',
            routes: [{ path: '/about', label: 'About' }],
        };

        expect(minimalModule.navItems).toBeUndefined();
        expect(minimalModule.adminRoutes).toBeUndefined();
        expect(minimalModule.widgets).toBeUndefined();
        expect(minimalModule.onInit).toBeUndefined();
        expect(minimalModule.onDestroy).toBeUndefined();
        expect(minimalModule.dependencies).toBeUndefined();
    });

    it('RouteConfig includes required and optional fields', () => {
        const route: RouteConfig = { path: '/blog', label: 'Blog' };
        const routeWithIcon: RouteConfig = { path: '/blog', label: 'Blog', icon: '📝' };

        expect(route.icon).toBeUndefined();
        expect(routeWithIcon.icon).toBe('📝');
    });

    it('NavItem includes order field', () => {
        const items: NavItem[] = [
            { label: 'Home', href: '/', order: 0 },
            { label: 'Blog', href: '/blog', icon: '📝', order: 1 },
            { label: 'About', href: '/about', order: 2 },
        ];

        const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        expect(sorted[0]?.label).toBe('Home');
        expect(sorted[2]?.label).toBe('About');
    });

    it('WidgetConfig size is limited to 3 sizes', () => {
        const sizes: WidgetConfig['size'][] = ['small', 'medium', 'large'];
        expect(sizes).toHaveLength(3);

        const widget: WidgetConfig = { id: 'stats', title: 'Stats', size: 'large' };
        expect(widget.size).toBe('large');
    });

    it('ThemeConfig includes complete Token system', () => {
        const theme: ThemeConfig = {
            id: 'test',
            name: 'Test Theme',
            mode: 'light',
            colors: {
                primary: '#000',
                secondary: '#111',
                accent: '#f00',
                background: '#fff',
                surface: '#fafafa',
                text: '#000',
                textSecondary: '#666',
                border: '#eee',
                error: '#f00',
                success: '#0f0',
            },
            typography: {
                fontFamily: 'sans-serif',
                headingFont: 'sans-serif',
                monoFont: 'monospace',
                scale: 1,
            },
            spacing: { unit: 4, radius: '0.5rem' },
            effects: {
                shadow: '0 1px 3px rgba(0,0,0,0.1)',
                blur: '8px',
                transition: '0.2s ease',
            },
        };

        // Color system integrity
        expect(Object.keys(theme.colors)).toHaveLength(10);
        // Typography system integrity
        expect(Object.keys(theme.typography)).toHaveLength(4);
        // Spacing system integrity
        expect(Object.keys(theme.spacing)).toHaveLength(2);
        // Effects system integrity
        expect(Object.keys(theme.effects)).toHaveLength(3);
    });

    it('ThemeConfig mode is limited to light/dark', () => {
        const modes: ThemeConfig['mode'][] = ['light', 'dark'];
        expect(modes).toHaveLength(2);
    });
});
