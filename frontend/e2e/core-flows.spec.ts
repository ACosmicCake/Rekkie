import { test, expect } from '@playwright/test';

const UI_URL = "http://localhost:3000";

test.describe('Core User Flows', () => {

  const uniqueUser = `user_${Date.now()}@example.com`;
  const uniqueUsername = `user_${Date.now()}`;

  test('should allow a user to register, login, and manage interests', async ({ page }) => {
    // Registration
    await page.goto(`${UI_URL}/register`);
    await page.locator('input[name="username"]').fill(uniqueUsername);
    await page.locator('input[name="email"]').fill(uniqueUser);
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(`${UI_URL}/login`);

    // Login
    await page.locator('input[name="username"]').fill(uniqueUsername);
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(`${UI_URL}/dashboard`);
    await expect(page.locator('h1')).toContainText('Your Recommended Events');

    // Navigate to Profile and add an interest
    // This assumes there's a link to the profile page on the dashboard
    await page.goto(`${UI_URL}/profile`);
    await expect(page.locator('h1')).toContainText('Your Profile');

    await page.locator('input[placeholder="Interest Category (e.g., music)"]').fill('music');
    await page.locator('input[placeholder="Interest Value (e.g., Jazz)"]').fill('Jazz');
    await page.locator('button:has-text("Add")').click();

    // Check if interest was added
    await expect(page.locator('li:has-text("music: Jazz")')).toBeVisible();

    // Delete the interest
    await page.locator('li:has-text("music: Jazz") button').click();
    await expect(page.locator('li:has-text("music: Jazz")')).not.toBeVisible();
  });


  test('should allow a user to search for an event', async ({ page }) => {
    await page.goto(`${UI_URL}/dashboard`);

    // Assuming there's an event with "Art" in its description or type
    const searchQuery = "Art";
    await page.locator('input[placeholder*="Search for events"]').fill(searchQuery);
    await page.locator('button:has-text("Search")').click();

    await expect(page.locator('h1')).toContainText('Search Results');

    // Wait for search results to load
    await page.waitForSelector('.grid');

    const firstEventCard = page.locator('.grid > div').first();
    await expect(firstEventCard).toBeVisible();
  });

});
