import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const webSrc = path.join(root, 'apps/web/src');
const apiSrc = path.join(root, 'packages/api/src');
const dbDir = path.join(root, 'packages/db/prisma');

describe('Auth.js Configuration', () => {
    const authPath = path.join(webSrc, 'auth.ts');

    it('auth.ts exists', () => {
        expect(fs.existsSync(authPath)).toBe(true);
    });

    it('configures GitHub provider', () => {
        const content = fs.readFileSync(authPath, 'utf-8');
        expect(content).toContain('GitHub');
        expect(content).toContain('GITHUB_CLIENT_ID');
        expect(content).toContain('GITHUB_CLIENT_SECRET');
    });

    it('configures Credentials provider', () => {
        const content = fs.readFileSync(authPath, 'utf-8');
        expect(content).toContain('Credentials');
        expect(content).toContain('bcrypt');
        expect(content).toContain('passwordHash');
    });

    it('uses PrismaAdapter', () => {
        const content = fs.readFileSync(authPath, 'utf-8');
        expect(content).toContain('PrismaAdapter');
        expect(content).toContain('@auth/prisma-adapter');
    });

    it('uses JWT session strategy', () => {
        const content = fs.readFileSync(authPath, 'utf-8');
        expect(content).toContain("strategy: 'jwt'");
    });

    it('injects role into session callback', () => {
        const content = fs.readFileSync(authPath, 'utf-8');
        expect(content).toContain('session.user.role');
    });

    it('augments Session type with role', () => {
        const content = fs.readFileSync(authPath, 'utf-8');
        expect(content).toContain("declare module 'next-auth'");
        expect(content).toContain('role: string');
    });
});

describe('Auth Route Handler', () => {
    const routePath = path.join(webSrc, 'app/api/auth/[...nextauth]/route.ts');

    it('route handler exists', () => {
        expect(fs.existsSync(routePath)).toBe(true);
    });

    it('re-exports GET and POST from auth', () => {
        const content = fs.readFileSync(routePath, 'utf-8');
        expect(content).toContain('handlers');
        expect(content).toContain('GET');
        expect(content).toContain('POST');
    });
});

describe('Middleware', () => {
    const middlewarePath = path.join(webSrc, 'middleware.ts');

    it('middleware.ts exists', () => {
        expect(fs.existsSync(middlewarePath)).toBe(true);
    });

    it('protects /admin routes', () => {
        const content = fs.readFileSync(middlewarePath, 'utf-8');
        expect(content).toContain('/admin');
        expect(content).toContain('matcher');
    });

    it('redirects unauthenticated to sign-in', () => {
        const content = fs.readFileSync(middlewarePath, 'utf-8');
        expect(content).toContain('auth/signin');
        expect(content).toContain('callbackUrl');
    });

    it('checks admin role', () => {
        const content = fs.readFileSync(middlewarePath, 'utf-8');
        expect(content).toContain("role");
        expect(content).toContain("'admin'");
    });
});

describe('tRPC Auth Integration', () => {
    const trpcPath = path.join(apiSrc, 'trpc.ts');

    it('context accepts optional session', () => {
        const content = fs.readFileSync(trpcPath, 'utf-8');
        expect(content).toContain('session');
    });

    it('exports protectedProcedure', () => {
        const content = fs.readFileSync(trpcPath, 'utf-8');
        expect(content).toContain('protectedProcedure');
        expect(content).toContain('UNAUTHORIZED');
    });

    it('exports adminProcedure', () => {
        const content = fs.readFileSync(trpcPath, 'utf-8');
        expect(content).toContain('adminProcedure');
        expect(content).toContain('FORBIDDEN');
    });

    it('comment.create requires authentication', () => {
        const commentPath = path.join(apiSrc, 'routers/comment.ts');
        const content = fs.readFileSync(commentPath, 'utf-8');
        expect(content).toContain('protectedProcedure');
        expect(content).toContain('ctx.user');
    });

    it('tRPC route injects session into context', () => {
        const routePath = path.join(webSrc, 'app/api/trpc/[...trpc]/route.ts');
        const content = fs.readFileSync(routePath, 'utf-8');
        expect(content).toContain('auth()');
        expect(content).toContain('session');
    });
});

describe('Auth UI Components', () => {
    it('UserMenu.tsx exists', () => {
        expect(fs.existsSync(path.join(webSrc, 'components/auth/UserMenu.tsx'))).toBe(true);
    });

    it('AuthProvider.tsx exists', () => {
        expect(fs.existsSync(path.join(webSrc, 'components/auth/AuthProvider.tsx'))).toBe(true);
    });

    it('UserMenu handles signed-in / signed-out states', () => {
        const content = fs.readFileSync(path.join(webSrc, 'components/auth/UserMenu.tsx'), 'utf-8');
        expect(content).toContain('useSession');
        expect(content).toContain('signIn');
        expect(content).toContain('signOut');
    });

    it('AuthProvider wraps SessionProvider', () => {
        const content = fs.readFileSync(path.join(webSrc, 'components/auth/AuthProvider.tsx'), 'utf-8');
        expect(content).toContain('SessionProvider');
    });

    it('Header includes UserMenu', () => {
        const content = fs.readFileSync(path.join(webSrc, 'components/layout/Header.tsx'), 'utf-8');
        expect(content).toContain('UserMenu');
    });

    it('Root layout wraps with AuthProvider', () => {
        const content = fs.readFileSync(path.join(webSrc, 'app/layout.tsx'), 'utf-8');
        expect(content).toContain('AuthProvider');
    });
});

describe('Sign-In Page', () => {
    const signinPath = path.join(webSrc, 'app/auth/signin/page.tsx');

    it('sign-in page exists', () => {
        expect(fs.existsSync(signinPath)).toBe(true);
    });

    it('has GitHub sign-in button', () => {
        const content = fs.readFileSync(signinPath, 'utf-8');
        expect(content).toContain('github');
        expect(content).toContain('GitHub');
    });

    it('has email/password form', () => {
        const content = fs.readFileSync(signinPath, 'utf-8');
        expect(content).toContain('type="email"');
        expect(content).toContain('type="password"');
    });

    it('handles credential errors', () => {
        const content = fs.readFileSync(signinPath, 'utf-8');
        expect(content).toContain('error');
        expect(content).toContain('Invalid');
    });

    it('supports callbackUrl', () => {
        const content = fs.readFileSync(signinPath, 'utf-8');
        expect(content).toContain('callbackUrl');
    });
});

describe('Prisma Schema Auth Fields', () => {
    const schemaPath = path.join(dbDir, 'schema.prisma');
    const content = fs.readFileSync(schemaPath, 'utf-8');

    it('User has passwordHash field', () => {
        expect(content).toContain('passwordHash');
    });

    it('User has emailVerified field', () => {
        expect(content).toContain('emailVerified');
    });

    it('User has role field', () => {
        expect(content).toContain('role');
        expect(content).toContain('admin');
        expect(content).toContain('viewer');
    });
});

describe('Seed Script', () => {
    const seedPath = path.join(dbDir, 'seed.ts');
    const content = fs.readFileSync(seedPath, 'utf-8');

    it('hashes admin password', () => {
        expect(content).toContain('bcrypt');
        expect(content).toContain('hash');
        expect(content).toContain('passwordHash');
    });
});

describe('Environment Variables', () => {
    const envPath = path.join(root, '.env');
    const content = fs.readFileSync(envPath, 'utf-8');

    it('has AUTH_SECRET', () => {
        expect(content).toContain('AUTH_SECRET');
    });

    it('has AUTH_URL', () => {
        expect(content).toContain('AUTH_URL');
    });

    it('has GitHub OAuth vars', () => {
        expect(content).toContain('GITHUB_CLIENT_ID');
        expect(content).toContain('GITHUB_CLIENT_SECRET');
    });
});
