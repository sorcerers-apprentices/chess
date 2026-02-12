import { test, expect } from '@playwright/test';

test.describe('Signin Page', () => {
  const testUser = {
    email: 'angular-chess-test@mailinator.com',
    password: 'Pasword123',
    username: 'test-user',
  };

  test('Signin Page', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.locator('form.sign-in_form')).toBeVisible();

    await page.fill('input[formControlName="email"]', testUser.email);
    await page.fill('input[formControlName="password"]', testUser.password);

    await page.click('button[type="submit"]');

    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/signin|\/home/);
  });
});
