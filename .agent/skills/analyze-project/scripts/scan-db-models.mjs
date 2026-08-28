#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function findPrismaSchema(startDir = process.cwd()) {
  const candidates = [
    path.join(startDir, 'packages/db/prisma/schema.prisma'),
    path.join(startDir, 'prisma/schema.prisma'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

const schemaPath = findPrismaSchema();
if (!schemaPath) {
  console.log(JSON.stringify({ error: 'Prisma schema not found' }));
  process.exit(0);
}

const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
const migrationsDir = path.join(path.dirname(schemaPath), 'migrations');

let migrationCount = 0;
if (fs.existsSync(migrationsDir)) {
  migrationCount = fs.readdirSync(migrationsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).length;
}

const modelRegex = /model\s+(\w+)\s+{([\s\S]*?)}/g;
const models = [];

let match;
while ((match = modelRegex.exec(schemaContent)) !== null) {
  const modelName = match[1];
  const body = match[2];
  const lines = body.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//'));
  
  const fields = [];
  const indices = [];
  const relations = [];

  for (const line of lines) {
    if (line.startsWith('@@index') || line.startsWith('@@unique') || line.startsWith('@@id')) {
      indices.push(line);
    } else {
      const parts = line.split(/\s+/);
      const fieldName = parts[0];
      const fieldType = parts[1];
      fields.push({ name: fieldName, type: fieldType });
      if (line.includes('@relation')) {
        relations.push(line);
      }
    }
  }

  models.push({
    model: modelName,
    fieldCount: fields.length,
    relationsCount: relations.length,
    indexCount: indices.length,
    indices,
  });
}

console.log(JSON.stringify({
  schemaFile: path.relative(process.cwd(), schemaPath),
  migrationCount,
  totalModels: models.length,
  models,
}, null, 2));
