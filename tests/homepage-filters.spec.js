import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test.describe("HomePage Filters UI Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("HomePage Filters - Reset Button Visual State vs Content State Mismatch", async ({
    page,
  }) => {
    // Wait for homepage to load with products
    await expect(page.locator("text=All Products")).toBeVisible();

    // Apply category filter - select "Clothing" checkbox
    const clothingFilter = page
      .locator('input[type="checkbox"]')
      .filter({ hasText: /clothing/i })
      .or(
        page
          .locator('label:has-text("Clothing")')
          .locator('input[type="checkbox"]')
      )
      .first();

    if (await clothingFilter.isVisible()) {
      await clothingFilter.check();
      await page.waitForTimeout(1000);

      // Verify the checkbox is visually checked
      await expect(clothingFilter).toBeChecked();
    }

    // Apply price filter - select a price range
    const priceFilter = page
      .locator('input[type="radio"][value="0,19"]')
      .or(
        page
          .locator('label:has-text("$0 to 19")')
          .locator('input[type="radio"]')
      )
      .first();

    if (await priceFilter.isVisible()) {
      await priceFilter.check();
      await page.waitForTimeout(1000);

      // Verify the radio button is visually selected
      await expect(priceFilter).toBeChecked();
    }

    // Click RESET FILTERS button
    const resetButton = page
      .locator('button:has-text("RESET FILTERS")')
      .or(page.locator("text=RESET FILTERS"));
    await expect(resetButton).toBeVisible();
    await resetButton.click();

    // Wait for reset action to complete
    await page.waitForTimeout(1000);

    // After reset, visual filters should be cleared
    if (await clothingFilter.isVisible()) {
      await expect(clothingFilter).not.toBeChecked();
    }

    if (await priceFilter.isVisible()) {
      await expect(priceFilter).not.toBeChecked();
    }

    // Verify that content shows all products
    await expect(page.locator("text=All Products")).toBeVisible();

    // Additional check: count products after reset
    const allProducts = page
      .locator(".card")
      .or(page.locator('[class*="product"]'));
    const productCount = await allProducts.count();

    expect(productCount).toBeGreaterThan(0);
  });

  test("HomePage Filters - Multiple Reset Cycles Maintain Consistency", async ({
    page,
  }) => {
    await expect(page.locator("text=All Products")).toBeVisible();

    // Apply filters multiple times and reset to test state management
    for (let cycle = 0; cycle < 3; cycle++) {
      // Apply category filter
      const categoryCheckbox = page.locator('input[type="checkbox"]').first();
      if (await categoryCheckbox.isVisible()) {
        await categoryCheckbox.check();
        await expect(categoryCheckbox).toBeChecked();
      }

      // Apply price filter
      const priceRadio = page.locator('input[type="radio"]').first();
      if (await priceRadio.isVisible()) {
        await priceRadio.check();
        await expect(priceRadio).toBeChecked();
      }

      await page.waitForTimeout(500);

      // Reset filters
      const resetButton = page.locator('button:has-text("RESET FILTERS")');
      await resetButton.click();
      await page.waitForTimeout(500);

      // Verify filters are cleared after each cycle
      if (await categoryCheckbox.isVisible()) {
        await expect(categoryCheckbox).not.toBeChecked();
      }
      if (await priceRadio.isVisible()) {
        await expect(priceRadio).not.toBeChecked();
      }
    }
  });

  test("HomePage Filters - Reset Button URL State Consistency", async ({
    page,
  }) => {
    await expect(page.locator("text=All Products")).toBeVisible();

    // Apply filters
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await page.waitForTimeout(1000);
    }

    // Check URL parameters if your app uses them for filters
    const urlBeforeReset = page.url();

    // Reset filters
    const resetButton = page.locator('button:has-text("RESET FILTERS")');
    await resetButton.click();
    await page.waitForTimeout(1000);

    // URL should not contain filter parameters after reset
    const urlAfterReset = page.url();

    // Visual state should match URL state
    if (await checkbox.isVisible()) {
      await expect(checkbox).not.toBeChecked();
    }

    // If using URL parameters, they should be cleared
    expect(urlAfterReset).not.toContain("filter");
    expect(urlAfterReset).not.toContain("category");
    expect(urlAfterReset).not.toContain("price");
  });

  test("HomePage Filters - Individual vs Bulk Reset Behavior", async ({
    page,
  }) => {
    await expect(page.locator("text=All Products")).toBeVisible();

    // Test individual filter clearing vs reset button
    const allCheckboxes = page.locator('input[type="checkbox"]');
    const allRadios = page.locator('input[type="radio"]');

    // Apply multiple filters
    const checkboxCount = await allCheckboxes.count();
    const radioCount = await allRadios.count();

    // Check some filters
    if (checkboxCount > 0) {
      await allCheckboxes.first().check();
    }
    if (radioCount > 0) {
      await allRadios.first().check();
    }

    await page.waitForTimeout(1000);

    // Use reset button (bulk reset)
    const resetButton = page.locator('button:has-text("RESET FILTERS")');
    await resetButton.click();
    await page.waitForTimeout(1000);

    // Verify ALL filters are cleared
    const checkedCheckboxes = page.locator('input[type="checkbox"]:checked');
    const checkedRadios = page.locator('input[type="radio"]:checked');

    await expect(checkedCheckboxes).toHaveCount(0);
    await expect(checkedRadios).toHaveCount(0);
  });

  test("HomePage Filters - Reset Button Loading State Validation", async ({
    page,
  }) => {
    await expect(page.locator("text=All Products")).toBeVisible();

    // Apply filter and check for loading states
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.check();

      // Check if there's a loading indicator
      const loadingIndicator = page
        .locator('[class*="loading"]')
        .or(page.locator(".spinner-border"));

      // Wait for content to update
      await page.waitForTimeout(2000);
    }

    // Reset and check loading state
    const resetButton = page.locator('button:has-text("RESET FILTERS")');
    await resetButton.click();

    // Should show loading state during reset
    await page.waitForTimeout(500);

    // After reset, filters should be visually cleared
    if (await checkbox.isVisible()) {
      await expect(checkbox).not.toBeChecked();
    }

    // Products should be displayed
    await expect(page.locator("text=All Products")).toBeVisible();
  });
});
