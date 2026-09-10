import { expect, test } from '@playwright/test';

test('executes the packed SDK contract in a supported browser', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('sdk-status')).toHaveText('passed');
});
