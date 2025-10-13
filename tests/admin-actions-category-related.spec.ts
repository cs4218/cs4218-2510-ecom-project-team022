import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe('Admin Actions - Category Related', () => {
        test('Admin login -> click dashboard -> click Create Category -> create blank Category -> verify error message appears - Blank', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        //admin login
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('adminpw');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        await page.getByRole('button', { name: 'admin' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();

        //admin accidently create blank Category
        await page.getByRole('link', { name: 'Create Category' }).click();
        await page.getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('textbox', { name: 'Enter new category' }).press('Enter');
        await page.getByRole('button', { name: 'Submit' }).click();

        //ensure that category not created and toast error message
        await expect(page.getByText('Something went wrong in input form')).toBeVisible();
    });

    test('Admin login -> click dashboard -> click Create Category -> create NewCategory -> verify category created - Normal case', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        //admin login
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('adminpw');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        await page.getByRole('button', { name: 'admin' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Create Category' }).click();

        //admin create NewCategory
        await page.getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('textbox', { name: 'Enter new category' }).fill('NewCategory');
        await page.getByRole('button', { name: 'Submit' }).click();

        //ensure toast message appears
        await expect(page.getByText('NewCategory is created')).toBeVisible();

        //ensure NewCategory created successfully
        await expect(page.locator('tbody')).toContainText('NewCategory');
        await page.getByRole('button', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'All Categories' }).click();
        await expect(page.getByRole('main')).toContainText('NewCategory');
        await page.getByRole('button', { name: 'Categories' }).click();
        await expect(page.locator('#navbarTogglerDemo01')).toContainText('NewCategory');
    });

    test('Admin login -> click dashboard -> click Create Category -> edit to NewCategoryEdited -> verify NewCategoryEdited edited - Normal case', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        //admin login
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('adminpw');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        await page.getByRole('button', { name: 'admin' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Create Category' }).click();

        //admin edit category to NewCategoryEdited
        await expect(page.locator('tbody')).toContainText('NewCategory');
        await page.getByRole('button', { name: 'Edit' }).nth(3).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('NewCategoryEdited');
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();

        //ensure toast message appears
        await expect(page.getByText('NewCategoryEdited is updated')).toBeVisible();

        //ensure NewCategoryEdited edited successfully
        await expect(page.locator('tbody')).toContainText('NewCategoryEdited');
        await page.getByRole('button', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'All Categories' }).click();
        await expect(page.getByRole('main')).toContainText('NewCategoryEdited');
        await page.getByRole('button', { name: 'Categories' }).click();
        await expect(page.locator('#navbarTogglerDemo01')).toContainText('NewCategoryEdited');
    });

    test('Admin login -> click dashboard -> click Create Category -> delete NewCategoryEdited -> verify NewCategoryEdited deleted', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        //admin login
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('adminpw');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        
        //admin deletes NewCategoryEdited
        await page.getByRole('button', { name: 'admin' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Create Category' }).click();
        await expect(page.locator('tbody')).toContainText('NewCategoryEdited');
        await page.getByRole('button', { name: 'Delete' }).nth(3).click();

        //ensure toast message appears
        await expect(page.getByText('category is deleted')).toBeVisible();
    });
});