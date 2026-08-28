import fs from 'node:fs';
import path from 'node:path';

/**
 * Cross-platform cache directory cleanup script for Next.js web application.
 * Replaces unix-only `rm -rf .next .turbo`.
 */
const dirsToClean = ['.next', '.turbo'];

for (const dir of dirsToClean) {
  const fullPath = path.resolve(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } catch (err) {
      console.warn(`[clean] Failed to remove ${dir}:`, err);
    }
  }
}
