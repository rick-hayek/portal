#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function findWorkspaceRoot(startDir = process.cwd()) {
  let current = startDir;
  while (current !== path.dirname(current)) {
    if (
      fs.existsSync(path.join(current, 'pnpm-workspace.yaml')) ||
      fs.existsSync(path.join(current, 'turbo.json')) ||
      fs.existsSync(path.join(current, 'package.json'))
    ) {
      return current;
    }
    current = path.dirname(current);
  }
  return startDir;
}

const rootDir = findWorkspaceRoot();

function findAppDir() {
  const candidates = [
    path.join(rootDir, 'apps/web/src/app'),
    path.join(rootDir, 'apps/web/app'),
    path.join(rootDir, 'src/app'),
    path.join(rootDir, 'app'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

const appDir = findAppDir();
const routes = {
  pages: [],
  routeHandlers: [],
  layouts: [],
  backendRouters: [],
};

if (appDir) {
  function traverse(dir, currentRoute = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const segment = entry.name;
        traverse(fullPath, `${currentRoute}/${segment}`);
      } else if (entry.isFile()) {
        if (entry.name === 'page.tsx' || entry.name === 'page.jsx' || entry.name === 'page.js') {
          routes.pages.push(currentRoute || '/');
        } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
          routes.routeHandlers.push(currentRoute);
        }
      }
    }
  }
  traverse(appDir);
  routes.pages.sort();
  routes.routeHandlers.sort();
}

// 1. Detect Frontend Layout Engines & Header Variants
const layoutCandidates = [
  path.join(rootDir, 'apps/web/src/components/layout/headers'),
  path.join(rootDir, 'apps/web/src/components/home/layouts'),
  path.join(rootDir, 'apps/web/src/components/layout'),
];

for (const dir of layoutCandidates) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.tsx') || f.endsWith('.jsx'));
    for (const file of files) {
      const name = path.basename(file, path.extname(file));
      if (!routes.layouts.includes(name) && !['index', 'Footer'].includes(name)) {
        routes.layouts.push(name);
      }
    }
  }
}

// 2. Scan Backend Routers & Flag Complexity / Monoliths
const apiRoutersDir = path.join(rootDir, 'packages/api/src/routers');
if (fs.existsSync(apiRoutersDir)) {
  const routerFiles = fs.readdirSync(apiRoutersDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));
  for (const file of routerFiles) {
    const filePath = path.join(apiRoutersDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lineCount = content.split('\n').length;
    const procedureCount = (content.match(/\b(publicProcedure|protectedProcedure|adminProcedure)\b/g) || []).length;
    const isLarge = lineCount > 500;

    routes.backendRouters.push({
      name: file,
      lineCount,
      procedureCount,
      isLarge,
      complexityNote: isLarge ? `High complexity / Monolithic router (${lineCount} lines)` : 'Modular',
    });
  }
  routes.backendRouters.sort((a, b) => b.lineCount - a.lineCount);
}

console.log(JSON.stringify(routes, null, 2));
