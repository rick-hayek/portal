import { prisma } from '@portal/db';
import type { MetadataRoute } from 'next';
import siteConfig from '../site.config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.site.url;

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/blog',
    '/portfolio',
    '/resume',
    '/gallery',
    '/guestbook',
    '/links',
    '/tools',
    '/tools/base64',
    '/tools/json-formatter',
    '/tools/jwt-decoder',
  ];

  // Fetch dynamic content from database
  const [posts, projects, books] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.project.findMany({
      select: { slug: true, updatedAt: true },
    }),
    prisma.book.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const locales = ['en', 'zh'];
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Generate entries for static routes (both languages)
  for (const route of staticRoutes) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      });
    }
  }

  // 2. Generate entries for blog posts (both languages)
  for (const post of posts) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  // 3. Generate entries for portfolio projects (both languages)
  for (const project of projects) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/portfolio/${project.slug}`,
        lastModified: project.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  // 4. Generate entries for books (both languages)
  for (const book of books) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/books/${book.slug}`,
        lastModified: book.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return sitemapEntries;
}
