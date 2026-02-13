import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const webSrc = path.join(root, 'apps/web/src');
const apiSrc = path.join(root, 'packages/api/src');

// ─── Search ────────────────────────────────────────────

describe('Search — MeiliSearch Client', () => {
    const searchPath = path.join(apiSrc, 'search.ts');

    it('search.ts exists', () => {
        expect(fs.existsSync(searchPath)).toBe(true);
    });

    it('initializes MeiliSearch client', () => {
        const content = fs.readFileSync(searchPath, 'utf-8');
        expect(content).toContain('MeiliSearch');
        expect(content).toContain('MEILISEARCH_URL');
    });

    it('exports index helpers', () => {
        const content = fs.readFileSync(searchPath, 'utf-8');
        expect(content).toContain('ensurePostsIndex');
        expect(content).toContain('indexPost');
        expect(content).toContain('removePostFromIndex');
    });

    it('configures searchable/filterable attributes', () => {
        const content = fs.readFileSync(searchPath, 'utf-8');
        expect(content).toContain('searchableAttributes');
        expect(content).toContain('filterableAttributes');
    });
});

describe('Search — tRPC Router', () => {
    const routerPath = path.join(apiSrc, 'routers/search.ts');

    it('search router exists', () => {
        expect(fs.existsSync(routerPath)).toBe(true);
    });

    it('has query procedure', () => {
        const content = fs.readFileSync(routerPath, 'utf-8');
        expect(content).toContain('query');
        expect(content).toContain('q: z.string()');
    });

    it('highlights results', () => {
        const content = fs.readFileSync(routerPath, 'utf-8');
        expect(content).toContain('attributesToHighlight');
        expect(content).toContain('<mark>');
    });

    it('gracefully handles MeiliSearch unavailability', () => {
        const content = fs.readFileSync(routerPath, 'utf-8');
        expect(content).toContain('catch');
        expect(content).toContain('hits: []');
    });

    it('registered in appRouter', () => {
        const indexPath = path.join(apiSrc, 'index.ts');
        const content = fs.readFileSync(indexPath, 'utf-8');
        expect(content).toContain('search: searchRouter');
    });
});

describe('Search — Cmd+K Dialog UI', () => {
    const dialogPath = path.join(webSrc, 'components/search/SearchDialog.tsx');

    it('SearchDialog.tsx exists', () => {
        expect(fs.existsSync(dialogPath)).toBe(true);
    });

    it('registers ⌘K keyboard shortcut', () => {
        const content = fs.readFileSync(dialogPath, 'utf-8');
        expect(content).toContain('metaKey');
        expect(content).toContain("'k'");
    });

    it('supports keyboard navigation', () => {
        const content = fs.readFileSync(dialogPath, 'utf-8');
        expect(content).toContain('ArrowDown');
        expect(content).toContain('ArrowUp');
    });

    it('debounces search input', () => {
        const content = fs.readFileSync(dialogPath, 'utf-8');
        expect(content).toContain('setTimeout');
        expect(content).toContain('250');
    });

    it('added to Header', () => {
        const headerPath = path.join(webSrc, 'components/layout/Header.tsx');
        const content = fs.readFileSync(headerPath, 'utf-8');
        expect(content).toContain('SearchDialog');
    });
});

// ─── Admin Dashboard ─────────────────────────────────

describe('Admin — tRPC Router', () => {
    const adminPath = path.join(apiSrc, 'routers/admin.ts');

    it('admin router exists', () => {
        expect(fs.existsSync(adminPath)).toBe(true);
    });

    it('all procedures use adminProcedure', () => {
        const content = fs.readFileSync(adminPath, 'utf-8');
        expect(content).toContain('adminProcedure');
        // Should not use publicProcedure
        expect(content).not.toContain('publicProcedure');
    });

    it('has dashboard stats', () => {
        const content = fs.readFileSync(adminPath, 'utf-8');
        expect(content).toContain('stats');
        expect(content).toContain('totalPosts');
        expect(content).toContain('totalComments');
    });

    it('has post CRUD mutations', () => {
        const content = fs.readFileSync(adminPath, 'utf-8');
        expect(content).toContain('postCreate');
        expect(content).toContain('postUpdate');
        expect(content).toContain('postDelete');
    });

    it('has comment moderation', () => {
        const content = fs.readFileSync(adminPath, 'utf-8');
        expect(content).toContain('commentModerate');
        expect(content).toContain('commentDelete');
    });

    it('has guestbook moderation', () => {
        const content = fs.readFileSync(adminPath, 'utf-8');
        expect(content).toContain('guestbookDelete');
    });

    it('registered in appRouter', () => {
        const indexPath = path.join(apiSrc, 'index.ts');
        const content = fs.readFileSync(indexPath, 'utf-8');
        expect(content).toContain('admin: adminRouter');
    });
});

describe('Admin — Layout', () => {
    const layoutPath = path.join(webSrc, 'app/(admin)/layout.tsx');

    it('admin layout exists', () => {
        expect(fs.existsSync(layoutPath)).toBe(true);
    });

    it('has sidebar navigation', () => {
        const content = fs.readFileSync(layoutPath, 'utf-8');
        expect(content).toContain('Dashboard');
        expect(content).toContain('Posts');
        expect(content).toContain('Comments');
        expect(content).toContain('Guestbook');
    });

    it('has back-to-site link', () => {
        const content = fs.readFileSync(layoutPath, 'utf-8');
        expect(content).toContain('Back to site');
    });

    it('includes UserMenu', () => {
        const content = fs.readFileSync(layoutPath, 'utf-8');
        expect(content).toContain('UserMenu');
    });
});

describe('Admin — Dashboard Page', () => {
    const dashPath = path.join(webSrc, 'app/(admin)/admin/page.tsx');

    it('dashboard page exists', () => {
        expect(fs.existsSync(dashPath)).toBe(true);
    });

    it('renders stat cards', () => {
        const content = fs.readFileSync(dashPath, 'utf-8');
        expect(content).toContain('StatCard');
        expect(content).toContain('Total Posts');
        expect(content).toContain('Page Views');
    });

    it('shows recent comments', () => {
        const content = fs.readFileSync(dashPath, 'utf-8');
        expect(content).toContain('Recent Comments');
    });

    it('shows recent guestbook', () => {
        const content = fs.readFileSync(dashPath, 'utf-8');
        expect(content).toContain('Recent Guestbook');
    });
});

describe('Admin — Post Management', () => {
    it('post list page exists', () => {
        expect(fs.existsSync(path.join(webSrc, 'app/(admin)/admin/posts/page.tsx'))).toBe(true);
    });

    it('post list has search and filter', () => {
        const content = fs.readFileSync(path.join(webSrc, 'app/(admin)/admin/posts/page.tsx'), 'utf-8');
        expect(content).toContain('search');
        expect(content).toContain('status');
        expect(content).toContain('Pagination');
    });

    it('new post page exists', () => {
        expect(fs.existsSync(path.join(webSrc, 'app/(admin)/admin/posts/new/page.tsx'))).toBe(true);
    });

    it('new post page has Markdown editor', () => {
        const content = fs.readFileSync(path.join(webSrc, 'app/(admin)/admin/posts/new/page.tsx'), 'utf-8');
        expect(content).toContain('Markdown');
        expect(content).toContain('content');
        expect(content).toContain('slug');
    });
});

describe('Admin — Comment Moderation', () => {
    const commentsPath = path.join(webSrc, 'app/(admin)/admin/comments/page.tsx');

    it('comments page exists', () => {
        expect(fs.existsSync(commentsPath)).toBe(true);
    });

    it('has approve/spam/delete actions', () => {
        const content = fs.readFileSync(commentsPath, 'utf-8');
        expect(content).toContain('Approve');
        expect(content).toContain('Spam');
        expect(content).toContain('Delete');
    });
});

describe('Admin — Guestbook Management', () => {
    const guestbookPath = path.join(webSrc, 'app/(admin)/admin/guestbook/page.tsx');

    it('guestbook page exists', () => {
        expect(fs.existsSync(guestbookPath)).toBe(true);
    });

    it('has delete action', () => {
        const content = fs.readFileSync(guestbookPath, 'utf-8');
        expect(content).toContain('Delete');
        expect(content).toContain('guestbookDelete');
    });
});
