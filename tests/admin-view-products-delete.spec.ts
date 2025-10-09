import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe('Admin View Products - Delete', () => {
    test('Admin login -> click dashboard -> click Product -> Delete -> verify delete is correct', async ({ page }) => {
        //admin login
        await page.goto('http://localhost:3000/login');
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('adminpw');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        await page.getByRole('button', { name: 'admin' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Products' }).click();
        
        //verify original book exist
        await expect(page.locator('h5')).toContainText('Normal Book');
        await page.getByRole('link', { name: 'Normal Book Normal Book This' }).click();
        page.once('dialog', dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            dialog.dismiss().catch(() => {});
        });
        await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();
        await page.goto('http://localhost:3000/dashboard/admin/products');
        await page.getByRole('link', { name: 'Home' }).click();
        await expect(page.getByRole('main')).toContainText('All Products');
    });

});