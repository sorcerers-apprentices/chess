import { expect, test } from '@playwright/test';

test('has build', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Chess Game/);
});
