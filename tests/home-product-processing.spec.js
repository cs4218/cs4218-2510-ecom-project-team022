const { test, expect } = require('@playwright/test');
const mockCategory = { _id: 'c1', name: 'Electronics', slug: 'electronics-slug' };
const mockLaptop = { _id: 'p101', name: 'Laptop', slug: 'laptop-slug', price: 1200, category: mockCategory, description: 'A powerful computing device for work and play.' };
const mockMouse = { _id: 'p102', name: 'Mouse', slug: 'mouse-slug', price: 50, category: mockCategory, description: 'Ergonomic mouse for comfortable navigation.' };
const mockEReader = { _id: 'p201', name: 'E-Reader', slug: 'e-reader-slug', price: 300, category: mockCategory, description: 'A device for reading books.' };


test.describe('E2E Home Page Product Discovery', () => {

    const BASE_URL = '/'; 
    const FILTER_API = '/api/v1/product/product-filters';

    test.beforeEach(async ({ page }) => {
        await page.route('/api/v1/product/product-list/1', async (route) => {
            await route.fulfill({
                status: 200,
                json: { success: true, products: [mockLaptop, mockMouse], total: 20 },
            });
        });
        await page.route(FILTER_API, async (route) => {
            const postData = route.request().postDataJSON();
            if (postData && Array.isArray(postData.radio) && postData.radio.includes('[40, 59]')) {
                 await route.fulfill({
                    status: 200,
                    json: { success: true, products: [mockMouse], total: 1 },
                });
            } else if (postData && postData.keyword === 'Laptop') {
                 await route.fulfill({
                    status: 200,
                    json: { success: true, products: [mockLaptop], total: 1 },
                });
            } else {
                 await route.fulfill({
                    status: 200,
                    json: { success: true, products: [mockLaptop, mockMouse], total: 2 },
                });
            }
        });

        await page.route('/api/v1/category/get-category', async (route) => {
            await route.fulfill({
                status: 200,
                json: { success: true, category: [mockCategory] },
            });
        });

        // 4. Mock Single Product Details (for navigation test)
        await page.route(`/api/v1/product/get-product/${mockLaptop.slug}`, async route => {
            await route.fulfill({
                status: 200,
                json: { success: true, product: mockLaptop },
            });
        });
        
        await page.goto(BASE_URL);
    });
    
    test('Should load initial products and filter sidebar', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Laptop', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Mouse', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Filter By Category' })).toBeVisible();
    });

    test('Should navigate from Home Page product card to Details view', async ({ page }) => {
        await expect(page.getByText('Laptop')).toBeVisible();
        const laptopCard = page.getByRole('heading', { name: 'Laptop', exact: true }).locator('..').locator('..').locator('..');
        await laptopCard.getByRole('button', { name: 'More Details' }).click();
        await expect(page).toHaveURL(new RegExp(`.*product/${mockLaptop.slug}`));
        await expect(page.getByText(mockLaptop.description)).toBeVisible();
    });

    test('Should load more products when the button is clicked', async ({ page }) => {
        await page.route('/api/v1/product/product-list/2', async route => {
            await route.fulfill({
                status: 200,
                json: { success: true, products: [mockEReader], total: 3, page: 2 },
            });
        });
        await expect(page.getByText(mockLaptop.name)).toBeVisible();
        await expect(page.getByText(mockEReader.name)).not.toBeVisible();
        await page.getByRole('button', { name: /Load more/i }).click();
        await expect(page.getByText(mockEReader.name)).toBeVisible();
        await expect(page.getByText('Loading ...')).not.toBeVisible();
    });
    
    test('Should search for products by keyword', async ({ page }) => {
        await expect(page.getByText(mockLaptop.name)).toBeVisible();
        await page.getByPlaceholder('Search').fill('Laptop');
        const searchButton = page.getByRole('button', { name: /search/i });
        await expect(searchButton).toBeEnabled();
        await searchButton.click();
        await expect(page.getByText('Found 1')).toBeVisible(); 
        await expect(page.getByRole('heading', { name: mockLaptop.name, exact: true })).toBeVisible(); 
        await expect(page.getByRole('heading', { name: mockMouse.name, exact: true })).not.toBeAttached();
    });
});
