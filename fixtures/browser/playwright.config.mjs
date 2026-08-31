import { defineConfig } from '@playwright/test';

export default defineConfig({
    projects: [
        { name: 'chromium', use: { browserName: 'chromium' } },
        { name: 'firefox', use: { browserName: 'firefox' } },
        { name: 'webkit', use: { browserName: 'webkit' } },
    ],
    testDir: './tests',
    use: {
        baseURL: 'http://127.0.0.1:4173',
    },
    webServer: {
        command: 'node_modules/.bin/vite preview --host 127.0.0.1 --port 4173',
        reuseExistingServer: !process.env.CI,
        url: 'http://127.0.0.1:4173',
    },
});
