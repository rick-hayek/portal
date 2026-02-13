import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ============================================================
// Phase 2 — Frontend Module Tests (About + Blog + Guestbook)
// ============================================================

const WEB_SRC = path.resolve(__dirname, '../apps/web/src');

describe('About Page', () => {
    const aboutPath = path.join(WEB_SRC, 'app/(site)/about/page.tsx');

    it('about/page.tsx exists', () => {
        expect(fs.existsSync(aboutPath)).toBe(true);
    });

    it('Imports siteConfig', () => {
        const content = fs.readFileSync(aboutPath, 'utf-8');
        expect(content).toContain('siteConfig');
    });

    it('Renders name and bio', () => {
        const content = fs.readFileSync(aboutPath, 'utf-8');
        expect(content).toContain('name');
        expect(content).toContain('bio');
    });

    it('Renders social links', () => {
        const content = fs.readFileSync(aboutPath, 'utf-8');
        expect(content).toContain('socialLinks');
    });

    it('Renders skills', () => {
        const content = fs.readFileSync(aboutPath, 'utf-8');
        expect(content).toContain('skills');
    });

    it('site.config.ts has about section', () => {
        const content = fs.readFileSync(
            path.join(WEB_SRC, 'site.config.ts'),
            'utf-8',
        );
        expect(content).toContain('about:');
        expect(content).toContain('skills:');
        expect(content).toContain('socialLinks:');
    });
});

describe('Blog Module — Pages', () => {
    it('blog/page.tsx exists', () => {
        expect(
            fs.existsSync(path.join(WEB_SRC, 'app/(site)/blog/page.tsx')),
        ).toBe(true);
    });

    it('blog/[slug]/page.tsx exists', () => {
        expect(
            fs.existsSync(path.join(WEB_SRC, 'app/(site)/blog/[slug]/page.tsx')),
        ).toBe(true);
    });
});

describe('Blog Module — List page', () => {
    const content = fs.readFileSync(
        path.join(WEB_SRC, 'app/(site)/blog/page.tsx'),
        'utf-8',
    );

    it('Uses tRPC post.list', () => {
        expect(content).toContain('post.list');
    });

    it('Uses tRPC category.list', () => {
        expect(content).toContain('category.list');
    });

    it('Has pagination controls', () => {
        expect(content).toContain('Previous');
        expect(content).toContain('Next');
    });

    it('Has category filter', () => {
        expect(content).toContain('category=');
    });

    it('Uses PostCard component', () => {
        expect(content).toContain('PostCard');
    });
});

describe('Blog Module — Detail page', () => {
    const content = fs.readFileSync(
        path.join(WEB_SRC, 'app/(site)/blog/[slug]/page.tsx'),
        'utf-8',
    );

    it('Uses tRPC post.bySlug', () => {
        expect(content).toContain('post.bySlug');
    });

    it('Uses MDXRemote for rendering', () => {
        expect(content).toContain('MDXRemote');
    });

    it('Uses remark-gfm and rehype plugins', () => {
        expect(content).toContain('remarkGfm');
        expect(content).toContain('rehypeHighlight');
        expect(content).toContain('rehypeSlug');
    });

    it('Uses CommentSection', () => {
        expect(content).toContain('CommentSection');
    });

    it('Has generateMetadata export', () => {
        expect(content).toContain('generateMetadata');
    });

    it('Handles 404 with notFound()', () => {
        expect(content).toContain('notFound');
    });
});

describe('Blog Module — Components', () => {
    it('PostCard.tsx exists', () => {
        expect(
            fs.existsSync(path.join(WEB_SRC, 'components/blog/PostCard.tsx')),
        ).toBe(true);
    });

    it('CommentSection.tsx exists', () => {
        expect(
            fs.existsSync(path.join(WEB_SRC, 'components/blog/CommentSection.tsx')),
        ).toBe(true);
    });

    it('PostCard renders title, excerpt, tags', () => {
        const content = fs.readFileSync(
            path.join(WEB_SRC, 'components/blog/PostCard.tsx'),
            'utf-8',
        );
        expect(content).toContain('post.title');
        expect(content).toContain('post.excerpt');
        expect(content).toContain('post.tags');
    });

    it('CommentSection is a client component', () => {
        const content = fs.readFileSync(
            path.join(WEB_SRC, 'components/blog/CommentSection.tsx'),
            'utf-8',
        );
        expect(content).toContain("'use client'");
    });

    it('CommentSection has form inputs', () => {
        const content = fs.readFileSync(
            path.join(WEB_SRC, 'components/blog/CommentSection.tsx'),
            'utf-8',
        );
        expect(content).toContain('input');
        expect(content).toContain('textarea');
        expect(content).toContain('submit');
    });

    it('CommentSection supports nested replies', () => {
        const content = fs.readFileSync(
            path.join(WEB_SRC, 'components/blog/CommentSection.tsx'),
            'utf-8',
        );
        expect(content).toContain('replies');
        expect(content).toContain('depth');
    });
});

describe('Guestbook Module', () => {
    const guestbookPath = path.join(WEB_SRC, 'app/(site)/guestbook/page.tsx');

    it('guestbook/page.tsx exists', () => {
        expect(fs.existsSync(guestbookPath)).toBe(true);
    });

    it('Is a client component', () => {
        const content = fs.readFileSync(guestbookPath, 'utf-8');
        expect(content).toContain("'use client'");
    });

    it('Has form with name and content inputs', () => {
        const content = fs.readFileSync(guestbookPath, 'utf-8');
        expect(content).toContain('input');
        expect(content).toContain('textarea');
        expect(content).toContain('submit');
    });

    it('Has character count', () => {
        const content = fs.readFileSync(guestbookPath, 'utf-8');
        expect(content).toContain('/500');
    });

    it('Fetches entries from guestbook.list', () => {
        const content = fs.readFileSync(guestbookPath, 'utf-8');
        expect(content).toContain('guestbook.list');
    });

    it('Submits to guestbook.create', () => {
        const content = fs.readFileSync(guestbookPath, 'utf-8');
        expect(content).toContain('guestbook.create');
    });
});

describe('RSS Feed', () => {
    const feedPath = path.join(WEB_SRC, 'app/api/feed.xml/route.ts');

    it('feed.xml/route.ts exists', () => {
        expect(fs.existsSync(feedPath)).toBe(true);
    });

    it('Generates RSS 2.0', () => {
        const content = fs.readFileSync(feedPath, 'utf-8');
        expect(content).toContain('feed.rss2()');
    });

    it('Sets correct Content-Type header', () => {
        const content = fs.readFileSync(feedPath, 'utf-8');
        expect(content).toContain('application/xml');
    });
});

describe('MDX Styles', () => {
    const cssPath = path.join(WEB_SRC, 'app/globals.css');
    const content = fs.readFileSync(cssPath, 'utf-8');

    it('Has prose-portal class', () => {
        expect(content).toContain('.prose-portal');
    });

    it('Styles headings', () => {
        expect(content).toContain('.prose-portal h1');
        expect(content).toContain('.prose-portal h2');
    });

    it('Styles code blocks', () => {
        expect(content).toContain('.prose-portal pre');
        expect(content).toContain('.prose-portal :not(pre)');
        expect(content).toContain('code');
    });

    it('Styles blockquotes', () => {
        expect(content).toContain('.prose-portal blockquote');
    });

    it('Styles tables', () => {
        expect(content).toContain('.prose-portal table');
    });
});
