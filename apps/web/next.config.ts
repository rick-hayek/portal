import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Resolve pnpm workspace + subpath exports for Turbopack
  serverExternalPackages: ['@trpc/server'],
  transpilePackages: ['@portal/api', '@portal/config', '@portal/db', '@portal/shared', '@portal/theme'],
};

export default nextConfig;
