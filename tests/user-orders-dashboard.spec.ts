import { test, expect } from "@playwright/test";
import { loginUser } from "./helpers";

test.describe("Existing user orders", () => {
  test("existing user vith orders can view their past orders", async ({ page }) => {
    // Login as known test user
    await loginUser(page, "user@gmail.com", "password");

    // Go to dashboard → orders
    await page.getByRole("button", { name: "user" }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByTestId("orders-link").click();

    // Wait for orders to load
    const orders = page.locator(".row.mb-2.p-3.card.flex-row"); 
    await expect(orders.first()).toBeVisible({ timeout: 10000 });

    // Check number of orders and key info
    const count = await orders.count();
    expect(count).toBe(3);
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

    // Check that at least one order row exists
    const rows = table.locator("tbody tr");
    if ((await rows.count()) > 0) {
      await expect(rows.first()).toBeVisible();
    }
  });
});
