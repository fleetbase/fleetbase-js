/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
    concurrency: 4,
    coverageAnalysis: 'perTest',
    ignorePatterns: ['.pnpm-store', 'coverage', 'dist', 'fixtures'],
    mutate: [
        'src/adapter.ts',
        'src/adapters/detect.ts',
        'src/adapters/fetch.ts',
        'src/collection.ts',
        'src/registry.ts',
        'src/resolver.ts',
        'src/resource.ts',
        'src/store-actions.ts',
        'src/store.ts',
    ],
    plugins: ['@stryker-mutator/vitest-runner'],
    reporters: ['clear-text', 'html', 'json'],
    tempDirName: '.stryker-tmp',
    testRunner: 'vitest',
    thresholds: {
        break: 76,
        high: 85,
        low: 76,
    },
    timeoutMS: 10_000,
    vitest: {
        configFile: 'vitest.config.ts',
        related: true,
    },
};
