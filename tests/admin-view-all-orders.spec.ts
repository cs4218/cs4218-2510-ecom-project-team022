import { test, expect } from "@playwright/test";
import { loginUser } from "./helpers";

// Mock orders for admin view
const MOCK_ADMIN_ORDERS = [
  {
    id: 1,
    status: "Pending",
    buyer: "Alice",
    date: "2025-10-20",
    payment: "Credit Card",
  },
  {
    id: 2,
    status: "Shipped",
    buyer: "Bob",
    date: "2025-10-19",
    payment: "PayPal",
  },
  {
    id: 3,
    status: "Delivered",
    buyer: "Charlie",
    date: "2025-10-18",
    payment: "Credit Card",
  },
];

test.describe("Admin view all orders (mocked)", () => {

  test.beforeEach(async ({ page }) => {
    // Mock the admin orders API
    await page.route('**/api/v1/auth/all-orders**', route => {
      route.fulfill({
        status: 200,
        json: MOCK_ADMIN_ORDERS,
      });
    });

    // Login as admin
    await loginUser(page, "admin@gmail.com", "password");

    // Navigate to Admin Dashboard → Orders
    await page.getByRole('button', { name: 'Admin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Orders' }).click();

    // Wait for at least one order container to appear
    const firstOrder = page.locator('div.border.shadow').first();
    await expect(firstOrder).toBeVisible({ timeout: 15000 });
  });

  test("orders count matches mock data", async ({ page }) => {
    const orders = page.locator('div.border.shadow');
    const count = await orders.count();
    expect(count).toBe(MOCK_ADMIN_ORDERS.length);
  });

  test("orders table headers are correct", async ({ page }) => {
    const firstOrder = page.locator('div.border.shadow').first();
    const table = firstOrder.locator('table');
    await expect(table).toBeVisible();

    const headers = table.locator('thead tr th');
    const expectedHeaders = ["#", "Status", "Buyer", "date", "Payment", "Quantity"];

    const headerCount = await headers.count();
    expect(headerCount).toBe(expectedHeaders.length);

    for (let i = 0; i < headerCount; i++) {
        const text = (await headers.nth(i).textContent())?.trim();
        expect(text).toBe(expectedHeaders[i]);
    }
  });
});
