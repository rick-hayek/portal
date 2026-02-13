import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ============================================================
// Phase 2 — API Layer Tests
// ============================================================

const API_SRC = path.resolve(__dirname, '../packages/api/src');
const WEB_SRC = path.resolve(__dirname, '../apps/web/src');

describe('API — tRPC initialization', () => {
    it('trpc.ts exists', () => {
        expect(fs.existsSync(path.join(API_SRC, 'trpc.ts'))).toBe(true);
    });

    it('trpc.ts exports createContext', () => {
        const content = fs.readFileSync(path.join(API_SRC, 'trpc.ts'), 'utf-8');
        expect(content).toContain('export async function createContext');
    });

    it('trpc.ts exports router, publicProcedure', () => {
        const content = fs.readFileSync(path.join(API_SRC, 'trpc.ts'), 'utf-8');
        expect(content).toContain('export const router');
        expect(content).toContain('export const publicProcedure');
    });

    it('Uses superjson transformer', () => {
        const content = fs.readFileSync(path.join(API_SRC, 'trpc.ts'), 'utf-8');
        expect(content).toContain('superjson');
    });

    it('Uses Prisma in context', () => {
        const content = fs.readFileSync(path.join(API_SRC, 'trpc.ts'), 'utf-8');
        expect(content).toContain('prisma');
    });
});

describe('API — Routers exist', () => {
    const ROUTERS = ['post.ts', 'category.ts', 'comment.ts', 'guestbook.ts'];

    it.each(ROUTERS)('routers/%s exists', (file) => {
        expect(fs.existsSync(path.join(API_SRC, 'routers', file))).toBe(true);
    });
});

describe('API — Post router', () => {
    const content = fs.readFileSync(path.join(API_SRC, 'routers/post.ts'), 'utf-8');

    it('Has list procedure', () => {
        expect(content).toContain("list:");
    });

    it('Has bySlug procedure', () => {
        expect(content).toContain("bySlug:");
    });

    it('Has recent procedure', () => {
        expect(content).toContain("recent:");
    });

    it('Supports pagination (page, limit)', () => {
        expect(content).toContain('page:');
        expect(content).toContain('limit:');
    });

    it('Supports category and tag filters', () => {
        expect(content).toContain('categorySlug');
        expect(content).toContain('tagSlug');
    });

    it('Includes author, category, tags in results', () => {
        expect(content).toContain('author:');
        expect(content).toContain('category:');
        expect(content).toContain('tags:');
    });
});

describe('API — Comment router', () => {
    const content = fs.readFileSync(path.join(API_SRC, 'routers/comment.ts'), 'utf-8');

    it('Has byPost procedure', () => {
        expect(content).toContain('byPost:');
    });

    it('Has create mutation', () => {
        expect(content).toContain('create:');
        expect(content).toContain('.mutation');
    });

    it('Validates authorName length', () => {
        expect(content).toContain('authorName');
        expect(content).toContain('.min(1)');
    });

    it('Supports nested replies', () => {
        expect(content).toContain('parentId');
        expect(content).toContain('replies');
    });
});

describe('API — Guestbook router', () => {
    const content = fs.readFileSync(path.join(API_SRC, 'routers/guestbook.ts'), 'utf-8');

    it('Has list procedure', () => {
        expect(content).toContain('list:');
    });

    it('Has create mutation', () => {
        expect(content).toContain('create:');
        expect(content).toContain('.mutation');
    });

    it('Validates content length (max 500)', () => {
        expect(content).toContain('.max(500)');
    });
});

describe('API — App router (index.ts)', () => {
    const content = fs.readFileSync(path.join(API_SRC, 'index.ts'), 'utf-8');

    it('Exports appRouter', () => {
        expect(content).toContain('export const appRouter');
    });

    it('Exports AppRouter type', () => {
        expect(content).toContain('export type AppRouter');
    });

    it('Exports createContext', () => {
        expect(content).toContain('createContext');
    });

    it('Mounts all 4 routers', () => {
        expect(content).toContain('post:');
        expect(content).toContain('category:');
        expect(content).toContain('comment:');
        expect(content).toContain('guestbook:');
    });
});

describe('API — Next.js integration', () => {
    it('tRPC route handler exists', () => {
        expect(
            fs.existsSync(path.join(WEB_SRC, 'app/api/trpc/[...trpc]/route.ts')),
        ).toBe(true);
    });

    it('tRPC client exists', () => {
        expect(fs.existsSync(path.join(WEB_SRC, 'lib/trpc-client.ts'))).toBe(true);
    });

    it('Route handler uses fetch adapter', () => {
        const content = fs.readFileSync(
            path.join(WEB_SRC, 'app/api/trpc/[...trpc]/route.ts'),
            'utf-8',
        );
        expect(content).toContain('fetchRequestHandler');
    });

    it('Route handler exports GET and POST', () => {
        const content = fs.readFileSync(
            path.join(WEB_SRC, 'app/api/trpc/[...trpc]/route.ts'),
            'utf-8',
        );
        expect(content).toContain('export');
        expect(content).toContain('GET');
        expect(content).toContain('POST');
    });
});

describe('Seed data', () => {
    it('seed.ts exists', () => {
        expect(
            fs.existsSync(
                path.resolve(__dirname, '../packages/db/prisma/seed.ts'),
            ),
        ).toBe(true);
    });

    it('Seeds users, categories, tags, posts, comments, guestbook', () => {
        const content = fs.readFileSync(
            path.resolve(__dirname, '../packages/db/prisma/seed.ts'),
            'utf-8',
        );
        expect(content).toContain('user.create');
        expect(content).toContain('category.create');
        expect(content).toContain('tag.create');
        expect(content).toContain('post.create');
        expect(content).toContain('comment.create');
        expect(content).toContain('guestbookEntry.create');
    });
});
