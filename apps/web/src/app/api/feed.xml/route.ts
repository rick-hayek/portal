import { Feed } from 'feed';
import { prisma } from '@portal/db';
import siteConfig from '@/site.config';

export async function GET() {
    const posts = await prisma.post.findMany({
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
        take: 20,
        include: {
            author: { select: { name: true, email: true } },
        },
    });

    const feed = new Feed({
        title: siteConfig.site.title,
        description: siteConfig.site.description,
        id: siteConfig.site.url,
        link: siteConfig.site.url,
        language: siteConfig.site.locale,
        copyright: `© ${new Date().getFullYear()} ${siteConfig.site.title}`,
        updated: posts[0]?.publishedAt ?? new Date(),
    });

    for (const post of posts) {
        feed.addItem({
            title: post.title,
            id: `${siteConfig.site.url}/blog/${post.slug}`,
            link: `${siteConfig.site.url}/blog/${post.slug}`,
            description: post.excerpt ?? '',
            content: post.content,
            author: post.author.name ? [{ name: post.author.name }] : undefined,
            date: post.publishedAt ?? post.createdAt,
        });
    }

    return new Response(feed.rss2(), {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
