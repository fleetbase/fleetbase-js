import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['coverage/**', 'dist/**', '.types/**', '.stryker-tmp/**', 'reports/**', 'fixtures/**'] },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked.map((config) => ({
        ...config,
        files: ['src/**/*.ts', 'tests/**/*.ts', 'vitest.config.ts'],
    })),
    {
        files: ['src/**/*.ts', 'tests/**/*.ts', 'vitest.config.ts'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
            globals: { ...globals.browser, ...globals.node },
        },
        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-base-to-string': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/unbound-method': 'off',
        },
    },
    {
        files: ['rollup.config.js', 'scripts/**/*.mjs'],
        languageOptions: { globals: globals.node },
    }
);
