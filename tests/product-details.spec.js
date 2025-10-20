const { test, expect } = require('@playwright/test');

const MAIN_PRODUCT_API = '/api/v1/product/get-product/laptop-slug';
const RELATED_PRODUCTS_API = '/api/v1/product/related-product/*';
const NEW_PRODUCT_API = '/api/v1/product/get-product/webcam-slug';

const mockCategory = { _id: 'c1', name: 'Electronics', slug: 'electronics-slug' };
const mockMainProduct = { 
    _id: 'p101', name: 'Laptop', slug: 'laptop-slug', price: 1200, category: mockCategory,
    description: 'The main product details.', photo: 'mock-photo', 
};
const mockRelatedProduct = { 
    _id: 'p201', name: 'Webcam', slug: 'webcam-slug', price: 75, category: mockCategory,
    description: 'HD streaming webcam.', photo: 'mock-photo', 
};
const mockNewDetailsProduct = { 
    ...mockRelatedProduct, 
    description: 'NEW: Re-fetched details for the Webcam.', 
};

test.describe('E2E Product Details & Cart Interaction', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.route(MAIN_PRODUCT_API, async route => {
            await route.fulfill({
                status: 200,
                json: { success: true, product: mockMainProduct },
            });
        });
        await page.route(RELATED_PRODUCTS_API, async route => {
            await route.fulfill({
                status: 200,
                json: { success: true, products: [mockRelatedProduct] }, 
            });
        });
        const mainProductPromise = page.waitForResponse(MAIN_PRODUCT_API);
        await page.goto('/product/laptop-slug');
        await mainProductPromise; 
        await expect(page.getByText(mockMainProduct.name)).toBeVisible();
    });

    test('1. Should add product to cart and verify it on the Cart page', async ({ page }) => {
        const addToCartButton = page.getByRole('button', { name: 'ADD TO CART' });
        await addToCartButton.click();
        await expect(page.getByText('Item Added to cart')).toBeVisible();
        await page.getByRole('link', { name: /cart/i }).click();
        await expect(page).toHaveURL(/.*\/cart/);
        await expect(page.getByText('Laptop')).toBeVisible();
        await expect(page.getByText('Total: $1,200.00')).toBeVisible();
    });
});
