import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe('Admin Actions - Product Related', () => {
    test('Admin login -> click dashboard -> click create Product -> create product -> verify create product is correct', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        //admin login
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('adminpw');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        await page.getByRole('button', { name: 'admin' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Create Product' }).click();

        //admin creates product
        await page.locator('#category-select-input').click();
        await page.getByTitle('Amazing Items').locator('div').click();
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('Amazing Book');
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('Wow');
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').fill('10');
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill('10');
        await page.locator('#rc_select_1').click();
        await page.getByText('Yes').click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

        //ensure toast message appears
        await expect(page.getByText('Product Created Successfully')).toBeVisible();
   
        //ensure product is created
        await expect(page.locator('h5')).toContainText('Amazing Book');
        await expect(page.getByRole('main')).toContainText('Wow');
    });

    test('Admin login -> click dashboard -> click create Product -> create blank product -> verify error message appears - Blank', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        //admin login
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('adminpw');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.getByRole('button', { name: 'admin' }).click();

        //admin accidently creates blank product
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Create Product' }).click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

        //ensure toast message appears
        await expect(page.getByText('something went wrong')).toBeVisible();
    });
});