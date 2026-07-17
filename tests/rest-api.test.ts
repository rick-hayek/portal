import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const WEB_SRC = path.resolve(__dirname, '../apps/web/src');

describe('REST API — File Structure', () => {
  it('api-auth helper exists', () => {
    expect(fs.existsSync(path.join(WEB_SRC, 'lib/api-auth.ts'))).toBe(true);
  });

  it('posts API endpoints exist', () => {
    expect(fs.existsSync(path.join(WEB_SRC, 'app/api/v1/posts/route.ts'))).toBe(true);
    expect(fs.existsSync(path.join(WEB_SRC, 'app/api/v1/posts/[id]/route.ts'))).toBe(true);
  });

  it('categories API endpoints exist', () => {
    expect(fs.existsSync(path.join(WEB_SRC, 'app/api/v1/categories/route.ts'))).toBe(true);
    expect(fs.existsSync(path.join(WEB_SRC, 'app/api/v1/categories/[id]/route.ts'))).toBe(true);
  });
});

describe('REST API — Posts Endpoint Exports', () => {
  it('posts/route.ts exports GET and POST', () => {
    const content = fs.readFileSync(path.join(WEB_SRC, 'app/api/v1/posts/route.ts'), 'utf-8');
    expect(content).toContain('export async function GET');
    expect(content).toContain('export async function POST');
  });

  it('posts/[id]/route.ts exports GET, PUT, and DELETE', () => {
    const content = fs.readFileSync(path.join(WEB_SRC, 'app/api/v1/posts/[id]/route.ts'), 'utf-8');
    expect(content).toContain('export async function GET');
    expect(content).toContain('export async function PUT');
    expect(content).toContain('export async function DELETE');
  });
});

describe('REST API — Categories Endpoint Exports', () => {
  it('categories/route.ts exports GET and POST', () => {
    const content = fs.readFileSync(path.join(WEB_SRC, 'app/api/v1/categories/route.ts'), 'utf-8');
    expect(content).toContain('export async function GET');
    expect(content).toContain('export async function POST');
  });

  it('categories/[id]/route.ts exports PUT and DELETE', () => {
    const content = fs.readFileSync(path.join(WEB_SRC, 'app/api/v1/categories/[id]/route.ts'), 'utf-8');
    expect(content).toContain('export async function PUT');
    expect(content).toContain('export async function DELETE');
  });
});
