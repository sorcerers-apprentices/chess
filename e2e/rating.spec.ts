import { expect, test } from '@playwright/test';

test.describe('Rating', () => {
  test('Rating table', async ({ page }) => {
    await page.goto('/rating');

    await expect(page.locator('app-rating-table')).toBeVisible();

    const ratingTable = page.locator('app-rating-table');
    await expect(ratingTable).toBeVisible();

    const errorElements = page.locator('.error, [data-testid="error"]');
    const errorCount = await errorElements.count();
    expect(errorCount).toBe(0);
  });
});
