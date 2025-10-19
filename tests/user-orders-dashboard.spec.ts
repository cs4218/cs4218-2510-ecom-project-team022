import { test, expect } from "@playwright/test";
import { loginUser } from "./helpers";

test.describe.parallel("Existing user orders", () => {

  test.beforeEach(async ({ page }) => {
    // Login as known test user
    await loginUser(page, "user@gmail.com", "password");

    // Go to dashboard → orders
    await page.getByRole("button", { name: "user" }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByTestId("orders-link").click();

    // Wait for orders to load
    const orders = page.locator(".row.mb-2.p-3.card.flex-row"); 
    await expect(orders.first()).toBeVisible({ timeout: 10000 });
  });

  test("orders table headers are correct", async ({ page }) => {
    const table = page.locator("table");
    await expect(table).toBeVisible({ timeout: 10000 });

    const expectedHeaders = ["#", "Status", "Buyer", "date", "Payment", "Quantity"];
    const headers = table.locator("thead tr th");
    const headerCount = await headers.count();
    expect(headerCount).toBe(expectedHeaders.length);

    for (let i = 0; i < headerCount; i++) {
      const text = await headers.nth(i).textContent();
      expect(text?.trim()).toBe(expectedHeaders[i]);
    }
  });

  test("orders count is correct", async ({ page }) => {
    const orders = page.locator(".row.mb-2.p-3.card.flex-row");
    const count = await orders.count();
    expect(count).toBe(3);
  });

  test("at least one order row exists", async ({ page }) => {
    const rows = page.locator("table tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    await expect(rows.first()).toBeVisible();
  });
});
