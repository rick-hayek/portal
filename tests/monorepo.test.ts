import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ============================================================
// Monorepo Project Structure Validation Tests
// ============================================================

const ROOT = path.resolve(__dirname, '..');

/** Check file or directory exists */
function exists(relativePath: string): boolean {
    return fs.existsSync(path.join(ROOT, relativePath));
}

/** Read JSON file */
function readJson(relativePath: string): Record<string, unknown> {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf-8'));
}

describe('Monorepo — Root Config Files', () => {
    it.each([
        'package.json',
        'pnpm-workspace.yaml',
        'turbo.json',
        'biome.json',
        'tsconfig.base.json',
        'docker-compose.yml',
        '.env.example',
        '.gitignore',
    ])('Exists %s', (file) => {
        expect(exists(file), `Missing root file: ${file}`).toBe(true);
    });
});

describe('Monorepo — Root package.json', () => {
    const pkg = readJson('package.json') as Record<string, unknown>;

    it('Project name is portal', () => {
        expect(pkg.name).toBe('portal');
    });

    it('Marked as private', () => {
        expect(pkg.private).toBe(true);
    });

    it('Contains dev / build / lint / typecheck scripts', () => {
        const scripts = pkg.scripts as Record<string, string>;
        expect(scripts.dev).toBeDefined();
        expect(scripts.build).toBeDefined();
        expect(scripts.lint).toBeDefined();
        expect(scripts.typecheck).toBeDefined();
    });

    it('devDependencies contains turbo / typescript / biome', () => {
        const devDeps = pkg.devDependencies as Record<string, string>;
        expect(devDeps.turbo).toBeDefined();
        expect(devDeps.typescript).toBeDefined();
        expect(devDeps['@biomejs/biome']).toBeDefined();
    });
});

describe('Monorepo — pnpm workspace', () => {
    it('workspace config defines apps/* and packages/*', () => {
        const content = fs.readFileSync(path.join(ROOT, 'pnpm-workspace.yaml'), 'utf-8');
        expect(content).toContain('apps/*');
        expect(content).toContain('packages/*');
    });
});

describe('Monorepo — App Structure', () => {
    it('apps/web directory exists', () => {
        expect(exists('apps/web')).toBe(true);
    });

    it('apps/web/package.json name is @portal/web', () => {
        const pkg = readJson('apps/web/package.json');
        expect(pkg.name).toBe('@portal/web');
    });

    it('apps/web contains Next.js config', () => {
        expect(exists('apps/web/next.config.ts')).toBe(true);
    });

    it('apps/web contains src/app directory', () => {
        expect(exists('apps/web/src/app')).toBe(true);
    });
});

describe('Monorepo — Package Structure', () => {
    const PACKAGES = [
        { name: '@portal/shared', dir: 'packages/shared' },
        { name: '@portal/config', dir: 'packages/config' },
        { name: '@portal/theme', dir: 'packages/theme' },
        { name: '@portal/db', dir: 'packages/db' },
        { name: '@portal/api', dir: 'packages/api' },
    ];

    it.each(PACKAGES)('$dir directory exists', ({ dir }) => {
        expect(exists(dir), `Missing package directory: ${dir}`).toBe(true);
    });

    it.each(PACKAGES)('$dir/package.json name is $name', ({ name, dir }) => {
        const pkg = readJson(`${dir}/package.json`);
        expect(pkg.name).toBe(name);
    });

    it.each(PACKAGES)('$dir/tsconfig.json exists', ({ dir }) => {
        expect(exists(`${dir}/tsconfig.json`)).toBe(true);
    });

    it.each(PACKAGES)('$dir/src/index.ts entry file exists', ({ dir }) => {
        expect(exists(`${dir}/src/index.ts`)).toBe(true);
    });
});

describe('Monorepo — Inter-package Dependencies', () => {
    it('@portal/config depends on @portal/shared', () => {
        const pkg = readJson('packages/config/package.json');
        const deps = pkg.dependencies as Record<string, string>;
        expect(deps['@portal/shared']).toBe('workspace:*');
    });

    it('@portal/theme depends on @portal/shared', () => {
        const pkg = readJson('packages/theme/package.json');
        const deps = pkg.dependencies as Record<string, string>;
        expect(deps['@portal/shared']).toBe('workspace:*');
    });

    it('@portal/api depends on @portal/db and @portal/shared', () => {
        const pkg = readJson('packages/api/package.json');
        const deps = pkg.dependencies as Record<string, string>;
        expect(deps['@portal/db']).toBe('workspace:*');
        expect(deps['@portal/shared']).toBe('workspace:*');
    });

    it('@portal/db depends on @portal/shared and @prisma/client', () => {
        const pkg = readJson('packages/db/package.json');
        const deps = pkg.dependencies as Record<string, string>;
        expect(deps['@portal/shared']).toBe('workspace:*');
        expect(deps['@prisma/client']).toBeDefined();
    });

    it('@portal/shared has no internal dependencies (leaf node)', () => {
        const pkg = readJson('packages/shared/package.json');
        const deps = (pkg.dependencies ?? {}) as Record<string, string>;
        const internalDeps = Object.keys(deps).filter((k) => k.startsWith('@portal/'));
        expect(internalDeps).toHaveLength(0);
    });
});

describe('Monorepo — Docker Compose', () => {
    const dockerCompose = fs.readFileSync(path.join(ROOT, 'docker-compose.yml'), 'utf-8');

    it('Defines postgres service', () => {
        expect(dockerCompose).toContain('postgres:');
    });

    it('Defines redis service', () => {
        expect(dockerCompose).toContain('redis:');
    });

    it('Defines meilisearch service', () => {
        expect(dockerCompose).toContain('meilisearch:');
    });

    it('PostgreSQL uses 16-alpine image', () => {
        expect(dockerCompose).toContain('postgres:16-alpine');
    });

    it('Redis uses 7-alpine image', () => {
        expect(dockerCompose).toContain('redis:7-alpine');
    });

    it('Contains healthcheck config', () => {
        expect(dockerCompose).toContain('healthcheck:');
    });
});

describe('Monorepo — .env.example', () => {
    const envExample = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf-8');

    it.each([
        'DATABASE_URL',
        'REDIS_URL',
        'MEILISEARCH_URL',
        'MEILISEARCH_KEY',
        'AUTH_SECRET',
    ])('Contains %s', (key) => {
        expect(envExample).toContain(key);
    });
});

describe('Monorepo — .gitignore', () => {
    const gitignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf-8');

    it.each([
        'node_modules/',
        '.next/',
        '.turbo/',
        '.env',
        'dist/',
    ])('Ignores %s', (pattern) => {
        expect(gitignore).toContain(pattern);
    });
});
