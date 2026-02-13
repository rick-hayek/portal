import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    test: {
        globals: true,
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['packages/*/src/**/*.ts'],
            exclude: ['**/*.d.ts', '**/index.ts'],
        },
    },
    resolve: {
        alias: {
            '@portal/shared': path.resolve(__dirname, 'packages/shared/src'),
            '@portal/config': path.resolve(__dirname, 'packages/config/src'),
            '@portal/theme': path.resolve(__dirname, 'packages/theme/src'),
            '@portal/db': path.resolve(__dirname, 'packages/db/src'),
            '@portal/api': path.resolve(__dirname, 'packages/api/src'),
        },
    },
});
