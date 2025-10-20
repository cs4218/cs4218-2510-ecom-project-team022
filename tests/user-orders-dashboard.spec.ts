import { test, expect } from "@playwright/test";
import { loginUser } from "./helpers";

// Mock orders data
const MOCK_ORDERS = [
  { status: "Pending", buyer: "Alice", date: "2025-10-20", payment: "Credit Card", quantity: 2 },
  { status: "Shipped", buyer: "Bob", date: "2025-10-19", payment: "PayPal", quantity: 1 },
  { status: "Delivered", buyer: "Charlie", date: "2025-10-18", payment: "Credit Card", quantity: 3 },
];

test.describe("Existing user orders", () => {

  test.beforeEach(async ({ page }) => {
    // Mock the orders API to return fixed data
    await page.route('**/api/orders**', route => {
      route.fulfill({
        status: 200,
        json: MOCK_ORDERS,
      });
    });

    // Login as known test user
    await loginUser(page, "user@gmail.com", "password");

    // Navigate to dashboard → orders
    await page.getByRole("button", { name: "user" }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByTestId("orders-link").click();

    // Wait for mocked orders to appear
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
    expect(count).toBe(MOCK_ORDERS.length);
  });

  test("at least one order row exists", async ({ page }) => {
    const rows = page.locator("table tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    await expect(rows.first()).toBeVisible();
  });

});
