import { prisma } from '../src';

export const KEY_PAGE_PATHS = [
  '/',
  '/blog',
  '/links',
  '/portfolio',
  '/trending',
  '/books',
  '/tools',
  '/about',
] as const;

export type KeyPagePath = (typeof KEY_PAGE_PATHS)[number];

export interface ArchivedPageViews {
  total: number;
  lastCleanedAt?: string;
  paths: Record<string, number>;
}

export function normalizeKeyPath(rawPath: string): KeyPagePath | null {
  if (!rawPath) return null;
  const clean = rawPath.split('?')[0].split('#')[0].trim();
  const withoutLocale = clean.replace(/^\/(?:zh|en)(?=\/|$)/, '') || '/';

  if (withoutLocale === '' || withoutLocale === '/') return '/';
  if (withoutLocale === '/blog') return '/blog';
  if (withoutLocale === '/links' || withoutLocale.startsWith('/links')) return '/links';
  if (withoutLocale === '/portfolio') return '/portfolio';
  if (withoutLocale === '/trending') return '/trending';
  if (withoutLocale === '/books') return '/books';
  if (withoutLocale === '/tools') return '/tools';
  if (withoutLocale === '/about') return '/about';

  return null;
}

async function main() {
  const args = process.argv.slice(2);
  let daysToKeep = 90;
  for (const arg of args) {
    if (arg.startsWith('--days=')) {
      const parsed = parseInt(arg.split('=')[1], 10);
      if (!isNaN(parsed) && parsed >= 30) {
        daysToKeep = parsed;
      }
    }
  }

  console.log(`[prune-analytics] Starting PageView retention prune (retaining last ${daysToKeep} days)...`);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysToKeep);

  const archivedConfig = await prisma.siteConfig.findUnique({
    where: { key: 'archived_page_views' },
  });

  let archived: ArchivedPageViews = { total: 0, paths: {} };
  if (archivedConfig?.value && typeof archivedConfig.value === 'object') {
    archived = archivedConfig.value as ArchivedPageViews;
  }
  if (!archived.paths) archived.paths = {};

  const [expiredTotal, expiredRows] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { lt: cutoff } } }),
    prisma.$queryRaw`
      SELECT path, COUNT(*)::int AS count
      FROM "PageView"
      WHERE "createdAt" < ${cutoff}
      GROUP BY path
    ` as Promise<{ path: string; count: number }[]>,
  ]);

  if (expiredTotal === 0) {
    console.log(`[prune-analytics] No expired records found prior to ${cutoff.toISOString()}. Nothing to prune.`);
    return;
  }

  archived.total = (archived.total || 0) + expiredTotal;
  archived.lastCleanedAt = new Date().toISOString();

  for (const row of expiredRows) {
    const norm = normalizeKeyPath(row.path);
    if (norm) {
      archived.paths[norm] = (archived.paths[norm] || 0) + row.count;
    }
  }

  await prisma.siteConfig.upsert({
    where: { key: 'archived_page_views' },
    create: {
      key: 'archived_page_views',
      value: archived as any,
    },
    update: {
      value: archived as any,
    },
  });

  const deleted = await prisma.pageView.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  console.log(`[prune-analytics] Successfully pruned ${deleted.count} expired PageView records.`);
  console.log(`[prune-analytics] Updated archived total: ${archived.total}`);
  console.log(`[prune-analytics] Updated archived key paths:`, archived.paths);
}

if (process.argv[1]?.endsWith('prune-analytics.ts')) {
  main()
    .catch((err) => {
      console.error('[prune-analytics] Failed:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
