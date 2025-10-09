import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe('Admin View Users', () => {
    //need ensure that there is an admin (admin@gmail.com, adminpw) before running test
    test('Admin login -> click dashboard -> click Users -> verify admin is in user list', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        //admin login 
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('adminpw');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).press('Enter');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        //navigate to Users
        await page.getByRole('button', { name: 'admin' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await expect(page.getByRole('main')).toContainText('Users');
        await page.getByRole('link', { name: 'Users' }).click();

        //ensure necessary headers are included
        await expect(page.locator('h1')).toContainText('All Users');
        await expect(page.locator('thead')).toContainText('Name');
        await expect(page.locator('thead')).toContainText('Email');
        await expect(page.locator('thead')).toContainText('Phone');
        await expect(page.locator('thead')).toMatchAriaSnapshot(`- cell "Address"`);
        await page.getByRole('cell', { name: 'Address' }).click();
        await expect(page.locator('thead')).toContainText('Address');
        await expect(page.locator('thead')).toContainText('Role');

        //ensure admin is in user list
        await expect(page.locator('tbody')).toContainText('admin');
        await expect(page.locator('tbody')).toContainText('admin@gmail.com');
        //check that user is not in the list
        await expect(page.locator('tbody')).not.toContainText('user'); 
        await expect(page.locator('tbody')).not.toContainText('user@gmail.com');
    });

    //need ensure that there is an admin (admin@gmail.com, adminpw) and does not have any user before running test
   test('Admin login and verify only admin -> user registers -> admin check that user is in user list', async ({ page }) => {
       await page.goto('http://localhost:3000/login');
       //admin login
       await page.getByRole('link', { name: 'Login' }).click();
       await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
       await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@gmail.com');
       await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
       await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('adminpw');
       await page.getByRole('button', { name: 'LOGIN' }).click();

       //navigate to Users
       await page.getByRole('button', { name: 'admin' }).click();
       await page.getByRole('link', { name: 'Dashboard' }).click();
       await page.getByRole('link', { name: 'Users' }).click();
       await page.getByRole('cell', { name: 'admin', exact: true }).click();
       //check that user is not in the list
       await expect(page.locator('tbody')).not.toContainText('user');
       await expect(page.locator('tbody')).not.toContainText('user@gmail.com');

       // admin logout
       await page.getByRole('button', { name: 'admin' }).click();
       await page.getByRole('link', { name: 'Logout' }).click();

       //new user registers
       await page.getByRole('link', { name: 'Register' }).click();
       await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('user');
       await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
       await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('user@gmail.com');
       await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
       await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('userpw');
       await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
       await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('11111111');
       await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
       await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('ang mo kio');
       await page.getByPlaceholder('Enter Your DOB').fill('2011-11-11');
       await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
       await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('running');
       await page.getByRole('button', { name: 'REGISTER' }).click();

       await page.goto('http://localhost:3000/login');

       //admin login again
       await page.getByRole('link', { name: 'Login' }).click();
       await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
       await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@gmail.com');
       await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
       await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('adminpw');
       await page.getByRole('button', { name: 'LOGIN' }).click();

       //admin verify user is in the user list
       await page.getByRole('button', { name: 'admin' }).click();
       await page.getByRole('link', { name: 'Dashboard' }).click();
       await page.getByRole('link', { name: 'Users' }).click();
       await expect(page.locator('tbody')).toContainText('user');
       await expect(page.locator('tbody')).toContainText('user@gmail.com');
   });
});

