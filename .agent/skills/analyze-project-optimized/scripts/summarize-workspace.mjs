#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function findWorkspaceRoot(startDir = process.cwd()) {
  let current = startDir;
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml')) || fs.existsSync(path.join(current, 'turbo.json'))) {
      return current;
    }
    current = path.dirname(current);
  }
  return startDir;
}

const rootDir = findWorkspaceRoot();

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

const rootPkg = readJsonSafe(path.join(rootDir, 'package.json')) || {};
const turboConfig = readJsonSafe(path.join(rootDir, 'turbo.json')) || {};

const packagesDir = path.join(rootDir, 'packages');
const appsDir = path.join(rootDir, 'apps');

function scanPkgs(dir, type) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => {
      const pkgJsonPath = path.join(dir, e.name, 'package.json');
      const pkgJson = readJsonSafe(pkgJsonPath);
      return {
        name: pkgJson?.name || e.name,
        folder: `${type}/${e.name}`,
        version: pkgJson?.version || '0.0.0',
        dependencies: Object.keys(pkgJson?.dependencies || {}),
        devDependencies: Object.keys(pkgJson?.devDependencies || {}),
      };
    });
}

const packages = scanPkgs(packagesDir, 'packages');
const apps = scanPkgs(appsDir, 'apps');

const summary = {
  projectName: rootPkg.name || path.basename(rootDir),
  version: rootPkg.version || '1.0.0',
  packageManager: rootPkg.packageManager || 'unknown',
  turboTasks: Object.keys(turboConfig.tasks || {}),
  globalEnv: turboConfig.globalEnv || [],
  apps: apps.map((a) => ({
    name: a.name,
    path: a.folder,
    internalDeps: a.dependencies.filter((d) => d.startsWith('@portal/') || d.includes('workspace:')),
    mainExternalDeps: a.dependencies.filter((d) => !d.startsWith('@portal/') && !d.includes('workspace:')).slice(0, 10),
  })),
  packages: packages.map((p) => ({
    name: p.name,
    path: p.folder,
    internalDeps: p.dependencies.filter((d) => d.startsWith('@portal/') || d.includes('workspace:')),
    externalDepsCount: p.dependencies.length,
  })),
};

console.log(JSON.stringify(summary, null, 2));
