const { test, expect } = require('@playwright/test');
const mockCategory = { _id: 'c1', name: 'Electronics', slug: 'electronics-slug' };
const mockCategoryProducts = [
    { _id: 'p101', name: 'Laptop', slug: 'laptop-slug', price: 1200, category: mockCategory, description: 'A powerful computing device for work and play.' },
    { _id: 'p102', name: 'Mouse', slug: 'mouse-slug', price: 50, category: mockCategory, description: 'Ergonomic mouse for comfortable navigation.' },
];

test.describe('E2E Category Navigation Validation', () => {
    
    const BASE_URL = '/'; 

    test.beforeEach(async ({ page }) => {
        await page.route('/api/v1/category/get-category', async (route) => {
            await route.fulfill({
                status: 200,
                json: { success: true, category: [mockCategory, { _id: 'c2', name: 'Books', slug: 'books-slug' }] },
            });
        });
        await page.route('/api/v1/product/product-category/electronics-slug', async (route) => {
            await route.fulfill({
                status: 200,
                json: { success: true, products: mockCategoryProducts, category: mockCategory, total: 2 },
            });
        });

        await page.goto(BASE_URL);
    });

    test('Should navigate to category page via Header dropdown and list products', async ({ page }) => {
        const productResponsePromise = page.waitForResponse('/api/v1/product/product-category/electronics-slug');

        await page.getByRole('button', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'Electronics', exact: true }).click();
        await productResponsePromise;
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*category\/electronics-slug/);
        await page.waitForSelector('.container');
        await expect(page.getByRole('heading', { name: /Category\s*-\s*Electronics/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Laptop', exact: true })).toBeVisible(); 
        await expect(page.getByRole('heading', { name: 'Mouse', exact: true })).toBeVisible();
    });

    test('Should navigate from All Categories page to product listing', async ({ page }) => {
        let productResponsePromise = page.waitForResponse('/api/v1/product/product-category/electronics-slug');
        
        await page.goto('/categories'); 

        const electronicsButton = page.getByRole('link', { name: 'Electronics', exact: true });
        await expect(electronicsButton).toBeVisible();
        await electronicsButton.click();

        await productResponsePromise;
        await page.waitForLoadState('networkidle'); 
        await expect(page).toHaveURL(/.*category\/electronics-slug/);
        await page.waitForSelector('.container');
        await expect(page.getByRole('heading', { name: /Category\s*-\s*Electronics/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Laptop', exact: true })).toBeVisible(); 
    });
});
