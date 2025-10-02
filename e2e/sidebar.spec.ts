import { expect, test } from '@playwright/test';

test.describe('Sidebar', () => {
  test('Sidebar', async ({ page }) => {
    await page.goto('/about');

    const menuButton = page.locator('button[tuiNavigationDrawer]');
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    await expect(page.locator('app-sidebar')).toBeVisible();
    await expect(page.locator('tui-data-list')).toBeVisible();
  });

  test('Dark mode toggle', async ({ page }) => {
    await page.goto('/about');

    const darkModeButton = page.locator('button[tuiIconButton]').last();
    await expect(darkModeButton).toBeVisible();

    await darkModeButton.click();
    await expect(darkModeButton).toBeVisible();
  });
});
