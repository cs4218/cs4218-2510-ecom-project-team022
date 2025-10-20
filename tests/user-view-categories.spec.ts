import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/';

test.describe('Category Tests', () => {

  // Helper to open "All Categories" menu
  async function openAllCategories(page: Page) {
    await page.getByRole('button', { name: 'Categories' }).click();
    await page.getByRole('link', { name: 'All Categories' }).click();
  }

 
  test('Categories render dynamically', async ({ page }) => {
    await page.goto(BASE_URL);
    await openAllCategories(page);

    // Use locator + visibility-based wait
    const categoryLinks = page.locator('.container a');
    await expect(categoryLinks.first()).toBeVisible({ timeout: 10000 });

    // Check count and visibility of all categories
    const count = await categoryLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(categoryLinks.nth(i)).toBeVisible();
    }
  });

  test('User can click the first category and see products', async ({ page }) => {
    await page.goto(BASE_URL);

    // Open "All Categories"
    await page.getByRole('button', { name: 'Categories' }).click();
    await page.getByRole('link', { name: 'All Categories' }).click();

    // Wait for categories to render inside container
    const categoryLinks = page.locator('.container a');
    await expect(categoryLinks.first()).toBeVisible({ timeout: 10000 });

    // Click the first category
    const firstCategory = categoryLinks.first();
    const categoryName = (await firstCategory.textContent())?.trim();
    console.log(`Clicking on category: ${categoryName}`);
    await firstCategory.click();

    // Wait for the page to load the category's products
    const products = page.locator('.card.m-2');
    await expect(products.first()).toBeVisible({ timeout: 10000 });

    // Verify that at least one product is visible
    const productCount = await products.count();
    console.log(`Found ${productCount} products in category "${categoryName}"`);
    expect(productCount).toBeGreaterThan(0);
  });

});
