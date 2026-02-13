import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ============================================================
// @portal/db — Prisma Schema Validation Tests
// ============================================================

const SCHEMA_PATH = path.resolve(__dirname, '../packages/db/prisma/schema.prisma');
const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');

describe('@portal/db — Prisma Schema File', () => {
    it('schema.prisma file exists', () => {
        expect(fs.existsSync(SCHEMA_PATH)).toBe(true);
    });

    it('Uses PostgreSQL provider', () => {
        expect(schema).toContain('provider = "postgresql"');
    });

    it('Uses prisma-client-js generator', () => {
        expect(schema).toContain('provider = "prisma-client-js"');
    });

    it('DATABASE_URL comes from environment variable', () => {
        expect(schema).toContain('env("DATABASE_URL")');
    });
});

describe('@portal/db — Data Model Integrity', () => {
    const REQUIRED_MODELS = [
        'User',
        'Account',
        'Session',
        'Post',
        'Category',
        'Tag',
        'PostTag',
        'Comment',
        'Project',
        'Media',
        'GuestbookEntry',
        'Link',
        'PageView',
        'SiteConfig',
    ];

    it.each(REQUIRED_MODELS)('Contains model %s', (model) => {
        const regex = new RegExp(`model\\s+${model}\\s+\\{`);
        expect(schema).toMatch(regex);
    });

    it('Total 14 data models', () => {
        const modelMatches = schema.match(/model\s+\w+\s+\{/g);
        expect(modelMatches).toHaveLength(14);
    });
});

describe('@portal/db — Key Field Validation', () => {
    // User Model
    it('User contains email unique constraint', () => {
        expect(schema).toMatch(/email\s+String\s+@unique/);
    });

    it('User contains role field (default viewer)', () => {
        expect(schema).toMatch(/role\s+String\s+@default\("viewer"\)/);
    });

    // Post Model
    it('Post contains slug unique constraint', () => {
        expect(schema).toContain('slug        String    @unique');
    });

    it('Post contains status field (default draft)', () => {
        expect(schema).toMatch(/status\s+String\s+@default\("draft"\)/);
    });

    it('Post relates to author (User)', () => {
        expect(schema).toContain('author   User      @relation');
    });

    // Comment Model
    it('Comment supports nested replies (self-reference)', () => {
        expect(schema).toContain('"CommentReplies"');
    });

    it('Comment contains review status (default pending)', () => {
        expect(schema).toMatch(/status\s+String\s+@default\("pending"\)/);
    });

    // Category & Tag
    it('Category slug is unique', () => {
        // Check only within Category model block
        const categoryBlock = extractModelBlock(schema, 'Category');
        expect(categoryBlock).toContain('@unique');
    });

    it('PostTag uses composite primary key', () => {
        expect(schema).toContain('@@id([postId, tagId])');
    });

    // GuestbookEntry
    it('GuestbookEntry is independent of User (no userId foreign key)', () => {
        const guestbookBlock = extractModelBlock(schema, 'GuestbookEntry');
        expect(guestbookBlock).not.toContain('userId');
    });

    // PageView
    it('PageView contains path index', () => {
        expect(schema).toContain('@@index([path])');
    });

    it('PageView contains createdAt index', () => {
        expect(schema).toContain('@@index([createdAt])');
    });

    // SiteConfig
    it('SiteConfig key is unique and indexed', () => {
        const configBlock = extractModelBlock(schema, 'SiteConfig');
        expect(configBlock).toContain('@unique');
        expect(configBlock).toContain('@@index([key])');
    });

    it('SiteConfig value is Json type', () => {
        const configBlock = extractModelBlock(schema, 'SiteConfig');
        expect(configBlock).toContain('Json');
    });
});

describe('@portal/db — Relationships and Cascade Deletes', () => {
    it('Account cascade delete (deleted with User)', () => {
        const accountBlock = extractModelBlock(schema, 'Account');
        expect(accountBlock).toContain('onDelete: Cascade');
    });

    it('Session cascade delete (deleted with User)', () => {
        const sessionBlock = extractModelBlock(schema, 'Session');
        expect(sessionBlock).toContain('onDelete: Cascade');
    });

    it('Comment cascade delete (deleted with Post)', () => {
        const commentBlock = extractModelBlock(schema, 'Comment');
        expect(commentBlock).toContain('onDelete: Cascade');
    });

    it('PostTag cascade delete (bidirectional)', () => {
        const postTagBlock = extractModelBlock(schema, 'PostTag');
        const cascadeCount = (postTagBlock.match(/onDelete: Cascade/g) || []).length;
        expect(cascadeCount).toBe(2);
    });

    it('Account has provider + providerAccountId composite unique constraint', () => {
        expect(schema).toContain('@@unique([provider, providerAccountId])');
    });
});

describe('@portal/db — Module Exports', () => {
    it('src/index.ts entry file exists', () => {
        const indexPath = path.resolve(__dirname, '../packages/db/src/index.ts');
        expect(fs.existsSync(indexPath)).toBe(true);
    });

    it('Exports PrismaClient (re-export from @prisma/client)', () => {
        const content = fs.readFileSync(
            path.resolve(__dirname, '../packages/db/src/index.ts'),
            'utf-8',
        );
        expect(content).toContain("export { PrismaClient } from '@prisma/client'");
    });

    it('Exports prisma singleton instance', () => {
        const content = fs.readFileSync(
            path.resolve(__dirname, '../packages/db/src/index.ts'),
            'utf-8',
        );
        expect(content).toContain('export const prisma');
    });

    it('singleton uses globalThis to prevent hot reload leaks', () => {
        const content = fs.readFileSync(
            path.resolve(__dirname, '../packages/db/src/index.ts'),
            'utf-8',
        );
        expect(content).toContain('globalForPrisma');
        expect(content).toContain('globalThis');
    });

    it('Detailed logging enabled in dev mode', () => {
        const content = fs.readFileSync(
            path.resolve(__dirname, '../packages/db/src/index.ts'),
            'utf-8',
        );
        expect(content).toContain("'query'");
        expect(content).toContain("'error'");
        expect(content).toContain("'warn'");
    });

    it('Only errors logged in production mode', () => {
        const content = fs.readFileSync(
            path.resolve(__dirname, '../packages/db/src/index.ts'),
            'utf-8',
        );
        // Check production branch has only ['error']
        expect(content).toMatch(/\['error'\]/);
    });
});

// ------ Utility Functions ------

/** Extract definition block of specified model from schema */
function extractModelBlock(schemaContent: string, modelName: string): string {
    const regex = new RegExp(`model\\s+${modelName}\\s+\\{([^}]+)\\}`, 's');
    const match = schemaContent.match(regex);
    return match?.[1] ?? '';
}
