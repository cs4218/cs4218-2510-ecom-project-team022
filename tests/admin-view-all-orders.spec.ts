import { test, expect } from "@playwright/test";
import { loginUser } from "./helpers";

test.describe.parallel("Admin view all orders", () => {
  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await loginUser(page, "admin@gmail.com", "password");

    // Navigate to Admin Dashboard → Orders
    await page.getByRole('button', { name: 'Admin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Orders' }).click();

    // Wait for at least one order container to appear
    const firstOrder = page.locator('div.border.shadow').first();
    await expect(firstOrder).toBeVisible({ timeout: 15000 });
  });

  test("orders table headers are correct", async ({ page }) => {
    const firstOrder = page.locator('div.border.shadow').first();
    const table = firstOrder.locator('table');
    await expect(table).toBeVisible();

    const headers = table.locator('thead tr th');
    const expectedHeaders = ["#", "Status", "Buyer", "date", "Payment", "Quantity"];
    for (let i = 0; i < expectedHeaders.length; i++) {
      await expect(headers.nth(i)).toHaveText(expectedHeaders[i]);
    }
  });

  test("first order has at least one row with visible buyer", async ({ page }) => {
    const firstOrder = page.locator('div.border.shadow').first();
    const rows = firstOrder.locator('tbody tr');

    // Wait for at least one row to exist
    await expect(rows.first()).toBeVisible();
    
    const buyerCell = rows.first().locator('td').nth(2);
    await expect(buyerCell).toBeVisible();
  });

  test("first order displays products correctly", async ({ page }) => {
    const firstOrder = page.locator('div.border.shadow').first();
    const products = firstOrder.locator('.container .row.mb-2.p-3.card.flex-row');

    // Wait for products to appear
    await expect(products.first()).toBeVisible();
    
    const productCount = await products.count();
    expect(productCount).toBeGreaterThan(0);
  });

  test("all orders have at least one product", async ({ page }) => {
    const orders = page.locator('div.border.shadow');
    const orderCount = await orders.count();
    expect(orderCount).toBeGreaterThan(0);

    for (let i = 0; i < orderCount; i++) {
      const products = orders.nth(i).locator('.container .row.mb-2.p-3.card.flex-row');
      const productCount = await products.count();
      expect(productCount).toBeGreaterThan(0);
    }
  });
});
