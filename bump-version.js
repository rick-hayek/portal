const fs = require('fs');
const path = require('path');

// Determine root directory (works whether script is run from root or scripts/)
const rootDir = __dirname.endsWith('scripts') ? path.resolve(__dirname, '..') : __dirname;

const pkgPath = path.join(rootDir, 'package.json');
const readmePath = path.join(rootDir, 'README.md');
const readmeEnPath = path.join(rootDir, 'README.en.md');

// 1. Read package.json
const pkgContent = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(pkgContent);
const currentVersion = pkg.version || '1.0.0';

// 2. Determine target version from argument or auto-increment patch
let targetVersion = process.argv[2];

if (!targetVersion) {
  const parts = currentVersion.split('.');
  if (parts.length >= 3) {
    const patch = parseInt(parts[parts.length - 1], 10) + 1;
    parts[parts.length - 1] = isNaN(patch) ? '1' : patch.toString();
    targetVersion = parts.join('.');
  } else {
    targetVersion = `${currentVersion}.1`;
  }
}

console.log(`Bumping version: ${currentVersion} -> ${targetVersion}`);

// 3. Update package.json
const updatedPkgContent = pkgContent.replace(
  /"version"\s*:\s*"[^"]+"/,
  `"version": "${targetVersion}"`,
);
fs.writeFileSync(pkgPath, updatedPkgContent, 'utf8');

// 4. Update README.md version badge
if (fs.existsSync(readmePath)) {
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  readmeContent = readmeContent.replace(
    /badge\/version-v[^-\s)]+-blue\.svg/g,
    `badge/version-v${targetVersion}-blue.svg`,
  );
  fs.writeFileSync(readmePath, readmeContent, 'utf8');
}

// 5. Update README.en.md version badge
if (fs.existsSync(readmeEnPath)) {
  let readmeEnContent = fs.readFileSync(readmeEnPath, 'utf8');
  readmeEnContent = readmeEnContent.replace(
    /badge\/version-v[^-\s)]+-blue\.svg/g,
    `badge/version-v${targetVersion}-blue.svg`,
  );
  fs.writeFileSync(readmeEnPath, readmeEnContent, 'utf8');
}

console.log(
  `Successfully updated version to v${targetVersion} in package.json, README.md, and README.en.md!`,
);
