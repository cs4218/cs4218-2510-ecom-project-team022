import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe('Admin View Products - View', () => {
    test('Admin login -> click dashboard -> click Product -> View', async ({ page }) => {
        await page.goto('http://localhost:3000/login');

        //admin login
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('adminpw');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        await page.getByRole('button', { name: 'admin' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Products' }).click();

        await expect(page.locator('h1')).toContainText('All Products List');
    });

    test('Admin login -> click dashboard -> click Product -> View -> verify product exists', async ({ page }) => {
        await page.goto('http://localhost:3000/login');

        //admin login
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('adminpw');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        await page.getByRole('button', { name: 'admin' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Products' }).click();

        await expect(page.locator('h1')).toContainText('All Products List');

        //verfiy product exists
        await expect(page.locator('h5')).toContainText('Must Buy Book');
        await expect(page.getByRole('main')).toContainText('Must Buy BookThis is an amazing book that you must buy');
    });
});