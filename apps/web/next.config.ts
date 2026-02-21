import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Resolve pnpm workspace + subpath exports for Turbopack
  serverExternalPackages: ['@trpc/server'],
  transpilePackages: ['@portal/api', '@portal/config', '@portal/db', '@portal/shared', '@portal/theme'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'picsum.photos' }
    ],
  },
};

export default withNextIntl(nextConfig);
