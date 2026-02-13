import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Helper to resolve project files
const resolve = (...parts: string[]) => path.resolve(root, ...parts);
const exists = (...parts: string[]) => fs.existsSync(resolve(...parts));
const read = (...parts: string[]) => fs.readFileSync(resolve(...parts), 'utf-8');

// ──────────────────────────────────────────────────────
// 4.1  Portfolio
// ──────────────────────────────────────────────────────

describe('Portfolio — tRPC router', () => {
    const routerPath = resolve('packages/api/src/routers/portfolio.ts');

    it('router file exists', () => {
        expect(fs.existsSync(routerPath)).toBe(true);
    });

    it('exports portfolioRouter', () => {
        expect(read('packages/api/src/routers/portfolio.ts')).toContain('export const portfolioRouter');
    });

    it('has list, bySlug, and techStacks procedures', () => {
        const content = read('packages/api/src/routers/portfolio.ts');
        expect(content).toContain('list:');
        expect(content).toContain('bySlug:');
        expect(content).toContain('techStacks:');
    });

    it('supports tech stack filtering', () => {
        const content = read('packages/api/src/routers/portfolio.ts');
        expect(content).toContain("tech:");
        expect(content).toContain("{ has:");
    });
});

describe('Portfolio — public pages', () => {
    it('portfolio list page exists', () => {
        expect(exists('apps/web/src/app/(site)/portfolio/page.tsx')).toBe(true);
    });

    it('portfolio detail page exists', () => {
        expect(exists('apps/web/src/app/(site)/portfolio/[slug]/page.tsx')).toBe(true);
    });

    it('list page has tech filter UI', () => {
        const content = read('apps/web/src/app/(site)/portfolio/page.tsx');
        expect(content).toContain('activeTech');
        expect(content).toContain('techStacks');
    });

    it('detail page shows live + repo links', () => {
        const content = read('apps/web/src/app/(site)/portfolio/[slug]/page.tsx');
        expect(content).toContain('liveUrl');
        expect(content).toContain('repoUrl');
    });

    it('site layout includes Portfolio nav item', () => {
        const content = read('apps/web/src/app/(site)/layout.tsx');
        expect(content).toContain("'/portfolio'");
    });
});

describe('Portfolio — admin CRUD', () => {
    it('admin router has projectCreate', () => {
        const content = read('packages/api/src/routers/admin.ts');
        expect(content).toContain('projectCreate:');
    });

    it('admin router has projectUpdate', () => {
        const content = read('packages/api/src/routers/admin.ts');
        expect(content).toContain('projectUpdate:');
    });

    it('admin router has projectDelete', () => {
        const content = read('packages/api/src/routers/admin.ts');
        expect(content).toContain('projectDelete:');
    });

    it('admin portfolio list page exists', () => {
        expect(exists('apps/web/src/app/(admin)/admin/portfolio/page.tsx')).toBe(true);
    });

    it('admin new project page exists', () => {
        expect(exists('apps/web/src/app/(admin)/admin/portfolio/new/page.tsx')).toBe(true);
    });
});

// ──────────────────────────────────────────────────────
// 4.2  Analytics
// ──────────────────────────────────────────────────────

describe('Analytics — tRPC router', () => {
    const routerPath = resolve('packages/api/src/routers/analytics.ts');

    it('router file exists', () => {
        expect(fs.existsSync(routerPath)).toBe(true);
    });

    it('exports analyticsRouter', () => {
        expect(read('packages/api/src/routers/analytics.ts')).toContain('export const analyticsRouter');
    });

    it('has track and summary procedures', () => {
        const content = read('packages/api/src/routers/analytics.ts');
        expect(content).toContain('track:');
        expect(content).toContain('summary:');
    });

    it('summary uses raw SQL for aggregation', () => {
        const content = read('packages/api/src/routers/analytics.ts');
        expect(content).toContain('$queryRaw');
    });
});

describe('Analytics — PageViewTracker', () => {
    it('PageViewTracker component exists', () => {
        expect(exists('apps/web/src/components/analytics/PageViewTracker.tsx')).toBe(true);
    });

    it('uses usePathname for route tracking', () => {
        const content = read('apps/web/src/components/analytics/PageViewTracker.tsx');
        expect(content).toContain('usePathname');
    });

    it('skips admin and auth routes', () => {
        const content = read('apps/web/src/components/analytics/PageViewTracker.tsx');
        expect(content).toContain("'/admin'");
        expect(content).toContain("'/auth'");
    });

    it('is integrated into site layout', () => {
        const content = read('apps/web/src/app/(site)/layout.tsx');
        expect(content).toContain('PageViewTracker');
    });
});

describe('Analytics — admin page', () => {
    it('admin analytics page exists', () => {
        expect(exists('apps/web/src/app/(admin)/admin/analytics/page.tsx')).toBe(true);
    });

    it('has time range selector', () => {
        const content = read('apps/web/src/app/(admin)/admin/analytics/page.tsx');
        expect(content).toContain('setDays');
        expect(content).toContain('Last 7 days');
        expect(content).toContain('Last 30 days');
    });

    it('shows top pages', () => {
        const content = read('apps/web/src/app/(admin)/admin/analytics/page.tsx');
        expect(content).toContain('topPages');
    });
});

// ──────────────────────────────────────────────────────
// 4.3  Admin Polish
// ──────────────────────────────────────────────────────

describe('Admin — settings page', () => {
    it('settings page exists', () => {
        expect(exists('apps/web/src/app/(admin)/admin/settings/page.tsx')).toBe(true);
    });

    it('has site config fields', () => {
        const content = read('apps/web/src/app/(admin)/admin/settings/page.tsx');
        expect(content).toContain('site.title');
        expect(content).toContain('site.description');
    });

    it('uses configSet to save', () => {
        const content = read('apps/web/src/app/(admin)/admin/settings/page.tsx');
        expect(content).toContain('configSet');
    });
});

describe('Admin — config CRUD in admin router', () => {
    it('has configGet', () => {
        const content = read('packages/api/src/routers/admin.ts');
        expect(content).toContain('configGet:');
    });

    it('has configSet with upsert', () => {
        const content = read('packages/api/src/routers/admin.ts');
        expect(content).toContain('configSet:');
        expect(content).toContain('upsert');
    });

    it('has configList', () => {
        const content = read('packages/api/src/routers/admin.ts');
        expect(content).toContain('configList:');
    });
});

describe('Admin — sidebar navigation', () => {
    it('sidebar includes Portfolio link', () => {
        const content = read('apps/web/src/app/(admin)/layout.tsx');
        expect(content).toContain("'/admin/portfolio'");
    });

    it('sidebar includes Analytics link', () => {
        const content = read('apps/web/src/app/(admin)/layout.tsx');
        expect(content).toContain("'/admin/analytics'");
    });

    it('sidebar includes Settings link', () => {
        const content = read('apps/web/src/app/(admin)/layout.tsx');
        expect(content).toContain("'/admin/settings'");
    });
});

describe('Routers — appRouter integration', () => {
    it('appRouter includes portfolio router', () => {
        const content = read('packages/api/src/index.ts');
        expect(content).toContain('portfolio: portfolioRouter');
    });

    it('appRouter includes analytics router', () => {
        const content = read('packages/api/src/index.ts');
        expect(content).toContain('analytics: analyticsRouter');
    });
});

describe('Seed — portfolio data', () => {
    it('seed script creates sample projects', () => {
        const content = read('packages/db/prisma/seed.ts');
        expect(content).toContain('project.createMany');
    });

    it('seed script creates sample page views', () => {
        const content = read('packages/db/prisma/seed.ts');
        expect(content).toContain('pageView.createMany');
    });
});

describe('Prisma schema — Phase 4 models', () => {
    const schema = read('packages/db/prisma/schema.prisma');

    it('has Project model', () => {
        expect(schema).toContain('model Project');
    });

    it('Project has techStack array', () => {
        expect(schema).toContain('techStack   String[]');
    });

    it('has PageView model', () => {
        expect(schema).toContain('model PageView');
    });

    it('PageView has path index', () => {
        expect(schema).toContain('@@index([path])');
    });

    it('has SiteConfig model', () => {
        expect(schema).toContain('model SiteConfig');
    });
});
