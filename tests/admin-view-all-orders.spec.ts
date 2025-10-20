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
    products: [
      { name: "Wheelchair A", quantity: 2, price: 500 },
      { name: "Cushion X", quantity: 1, price: 50 },
    ],
  },
  {
    id: 2,
    status: "Shipped",
    buyer: "Bob",
    date: "2025-10-19",
    payment: "PayPal",
    products: [
      { name: "Walker B", quantity: 1, price: 200 },
    ],
  },
  {
    id: 3,
    status: "Delivered",
    buyer: "Charlie",
    date: "2025-10-18",
    payment: "Credit Card",
    products: [
      { name: "Wheelchair C", quantity: 3, price: 700 },
      { name: "Accessory Y", quantity: 2, price: 30 },
    ],
  },
];

test.describe.parallel("Admin view all orders (mocked)", () => {

  test.beforeEach(async ({ page }) => {
    // Mock the admin orders API
    await page.route('**/api/admin/orders**', route => {
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
  test("all orders have at least one product", async ({ page }) => {
    const orders = page.locator('div.border.shadow');
    const orderCount = await orders.count();

    expect(orderCount).toBeGreaterThan(0); // sanity check: at least one order exists

    for (let i = 0; i < orderCount; i++) {
        const products = orders.nth(i).locator('.container > .row.mb-2.p-3.card.flex-row'); 
        const productCount = await products.count();
        expect(productCount).toBeGreaterThan(0); // check each order has at least one product
    }
  });

});
