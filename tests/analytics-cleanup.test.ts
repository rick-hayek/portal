import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { KEY_PAGE_PATHS, normalizeKeyPath } from '../packages/api/src/routers/analytics';

const ROOT = path.resolve(__dirname, '..');

describe('Analytics — Key Page Path Normalization', () => {
  it('KEY_PAGE_PATHS contains all 8 required canonical pages', () => {
    expect(KEY_PAGE_PATHS).toEqual([
      '/',
      '/blog',
      '/links',
      '/portfolio',
      '/trending',
      '/books',
      '/tools',
      '/about',
    ]);
  });

  it('normalizes root and localized homepaths', () => {
    expect(normalizeKeyPath('/')).toBe('/');
    expect(normalizeKeyPath('/zh')).toBe('/');
    expect(normalizeKeyPath('/en')).toBe('/');
    expect(normalizeKeyPath('/zh/')).toBe('/');
    expect(normalizeKeyPath('/en/')).toBe('/');
  });

  it('normalizes blog hub paths and ignores individual post slugs', () => {
    expect(normalizeKeyPath('/blog')).toBe('/blog');
    expect(normalizeKeyPath('/zh/blog')).toBe('/blog');
    expect(normalizeKeyPath('/en/blog')).toBe('/blog');
    expect(normalizeKeyPath('/zh/blog?category=tech')).toBe('/blog');
    // Sub-routes like /blog/my-post should not count towards the /blog index
    expect(normalizeKeyPath('/blog/my-post')).toBeNull();
    expect(normalizeKeyPath('/zh/blog/my-post')).toBeNull();
  });

  it('normalizes links hub paths', () => {
    expect(normalizeKeyPath('/links')).toBe('/links');
    expect(normalizeKeyPath('/zh/links')).toBe('/links');
    expect(normalizeKeyPath('/en/links')).toBe('/links');
  });

  it('normalizes portfolio hub paths', () => {
    expect(normalizeKeyPath('/portfolio')).toBe('/portfolio');
    expect(normalizeKeyPath('/zh/portfolio')).toBe('/portfolio');
    expect(normalizeKeyPath('/en/portfolio')).toBe('/portfolio');
    expect(normalizeKeyPath('/portfolio/my-project')).toBeNull();
  });

  it('normalizes trending hub paths', () => {
    expect(normalizeKeyPath('/trending')).toBe('/trending');
    expect(normalizeKeyPath('/zh/trending')).toBe('/trending');
    expect(normalizeKeyPath('/en/trending')).toBe('/trending');
  });

  it('normalizes books, tools, and about hub paths', () => {
    expect(normalizeKeyPath('/books')).toBe('/books');
    expect(normalizeKeyPath('/zh/books')).toBe('/books');
    expect(normalizeKeyPath('/tools')).toBe('/tools');
    expect(normalizeKeyPath('/en/tools')).toBe('/tools');
    expect(normalizeKeyPath('/about')).toBe('/about');
    expect(normalizeKeyPath('/zh/about')).toBe('/about');
  });

  it('returns null for unknown or non-key paths', () => {
    expect(normalizeKeyPath('/random-page')).toBeNull();
    expect(normalizeKeyPath('')).toBeNull();
  });
});

describe('Analytics — Router & Procedures', () => {
  const routerPath = path.join(ROOT, 'packages/api/src/routers/analytics.ts');
  const content = fs.readFileSync(routerPath, 'utf-8');

  it('contains summary procedure with baseline archival support', () => {
    expect(content).toContain('summary: adminProcedure');
    expect(content).toContain('archived_page_views');
    expect(content).toContain('keyPageViews');
    expect(content).toContain('totalViews');
  });

  it('contains cleanup procedure with adminProcedure and daysToKeep parameter', () => {
    expect(content).toContain('cleanup: adminProcedure');
    expect(content).toContain('daysToKeep');
    expect(content).toContain('deleteMany');
  });
});

describe('Analytics — Retention CLI Script', () => {
  const scriptPath = path.join(ROOT, 'packages/db/scripts/prune-analytics.ts');
  const pkgPath = path.join(ROOT, 'package.json');

  it('prune-analytics script exists', () => {
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  it('package.json defines db:prune-analytics command', () => {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.scripts['db:prune-analytics']).toBeDefined();
    expect(pkg.scripts['db:prune-analytics']).toContain('prune-analytics.ts');
  });
});
