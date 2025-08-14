import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow a user to navigate to the login page', async ({ page }) => {
    await page.goto('/');

    // Check for the main heading on the home page (which we don't have yet, so let's check the header)
    await expect(page.getByText('City Events')).toBeVisible();

    // Click the sign-in button
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify we are on the login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('should display the login form correctly', async ({ page }) => {
    await page.goto('/login');

    // Check for the email input
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Email' })).toBeVisible();

    // Check for the GitHub sign-in button
    await expect(page.getByRole('button', { name: 'Sign in with GitHub' })).toBeVisible();
  });
});
