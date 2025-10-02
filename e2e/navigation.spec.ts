import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
  test('Navigate between public pages', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/\/about/);

    await page.goto('/rating');
    await expect(page).toHaveURL(/\/rating/);
    await expect(page.locator('app-rating-table')).toBeVisible();

    await page.goto('/about');
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator('app-project-description')).toBeVisible();
  });

  test('404 page for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route');

    await expect(page.locator('app-not-found-page')).toBeVisible();
    await expect(page).toHaveTitle(/404/);
  });
});
