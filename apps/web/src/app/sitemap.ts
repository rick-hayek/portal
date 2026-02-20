import { MetadataRoute } from 'next';
import siteConfig from '../site.config';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = siteConfig.site.url;

    const routes = [
        '',
        '/about',
        '/blog',
        '/portfolio',
        '/resume',
        '/gallery',
        '/guestbook',
        '/links',
        '/tools',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
