import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe('Admin View Products - Update', () => {
    //before running test need ensure that there is a product named "Must Buy Book"
    test('Admin login -> click dashboard -> click Product -> Update -> verify update is correct', async ({ page }) => {
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

        //verfiy that original is "Must Buy Book"
        await expect(page.locator('h5')).toContainText('Must Buy Book');
        await page.getByRole('link', { name: 'Must Buy Book Must Buy Book' }).click();

        //update book details
        await page.getByTitle('Amazing Items').click();
        await page.getByText('Bookk').nth(2).click();
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'write a name' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'write a name' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'write a name' }).press('ArrowLeft');
        await page.getByRole('textbox', { name: 'write a name' }).fill('Normal Book');
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('This is just a normal book');
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').fill('24');
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill('16');
        await page.getByText('No', { exact: true }).click();
        await page.getByText('Yes').click();
        await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();

        //verify that book is updated 
        await expect(page.locator('h5')).toContainText('Normal Book');
    });
});