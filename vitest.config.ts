import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            reporter: ['text', 'json-summary', 'lcov'],
            thresholds: { lines: 100, statements: 100, functions: 100, branches: 100 },
        },
    },
});
