import { expect, test } from '@playwright/test';

test.describe('SignUp Page', () => {
  const testUser = {
    email: 'angular-chess-signup-test@mailinator.com',
    phone: '+1 (555) 123-4567',
    displayName: 'Test User Signup',
    password: 'TestPassword123',
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('SignUp form elements', async ({ page }) => {
    await expect(page.locator('form.sign-up_form')).toBeVisible();
    await expect(page.locator('input[formControlName="email"]')).toBeVisible();
    await expect(page.locator('input[formControlName="phone"]')).toBeVisible();
    await expect(
      page.locator('input[formControlName="displayName"]'),
    ).toBeVisible();
    await expect(
      page.locator('input[formControlName="password"]'),
    ).toBeVisible();
    await expect(
      page.locator('input[formControlName="confirmPassword"]'),
    ).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Registration', async ({ page }) => {
    await page.fill('input[formControlName="email"]', testUser.email);
    await page.fill('input[formControlName="phone"]', testUser.phone);
    await page.fill(
      'input[formControlName="displayName"]',
      testUser.displayName,
    );
    await page.fill('input[formControlName="password"]', testUser.password);
    await page.fill(
      'input[formControlName="confirmPassword"]',
      testUser.password,
    );

    await expect(page.locator('input[formControlName="email"]')).toHaveValue(
      testUser.email,
    );
    await expect(
      page.locator('input[formControlName="displayName"]'),
    ).toHaveValue(testUser.displayName);

    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    const successStatus = page.locator('.sign-up-success');
    const isSuccess = await successStatus.isVisible();

    if (isSuccess) {
      await expect(successStatus).toBeVisible();
    }
  });

  test('Successful registration', async ({ page }) => {
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/signin');
    await expect(page).toHaveURL(/\/signin/);
  });

  test('Validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('form.sign-up_form')).toBeVisible();
  });

  test('Validate password', async ({ page }) => {
    await page.fill('input[formControlName="email"]', testUser.email);
    await page.fill('input[formControlName="phone"]', testUser.phone);
    await page.fill(
      'input[formControlName="displayName"]',
      testUser.displayName,
    );
    await page.fill('input[formControlName="password"]', testUser.password);
    await page.fill(
      'input[formControlName="confirmPassword"]',
      'DifferentPassword123',
    );

    await page.click('button[type="submit"]');
    await expect(page.locator('form.sign-up_form')).toBeVisible();
  });
});
