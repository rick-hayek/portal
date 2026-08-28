import fs from 'node:fs';
import path from 'node:path';

/**
 * Cross-platform source map cleanup script for Next.js build output.
 * Replaces unix-only `find .next -name "*.map" -delete`.
 */
function removeSourceMaps(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removeSourceMaps(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.map')) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.warn(`[clean-sourcemaps] Failed to remove ${fullPath}:`, err);
      }
    }
  }
}

const targetDir = path.resolve(process.cwd(), '.next');
removeSourceMaps(targetDir);
