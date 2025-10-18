import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.describe('Footer Component UI Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Footer - Global Footer Presence Across All Pages', async ({ page }) => {
    // Test footer presence on main pages
    const testPages = ['/', '/about', '/contact', '/policy'];
    
    for (const pagePath of testPages) {
      await page.goto(pagePath);
      
      // Verify footer exists
      const footer = page.locator('.footer');
      await expect(footer).toBeVisible();
      
      // Verify copyright text is consistent
      await expect(footer).toContainText('All Rights Reserved');
      await expect(footer).toContainText('TestingComp');
    }
  });

  test('Footer - Link Functionality and Navigation Flow', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    
    // Test About link navigation
    const aboutLink = footer.locator('a[href="/about"]');
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();
    await expect(page).toHaveURL('/about');
    await expect(page).toHaveTitle(/About us/);
    
    // Verify about page content loads by checking for image
    await expect(page.locator('img[src="/images/about.jpeg"]')).toBeVisible();
    
    // Verify footer is present on About page too
    await expect(footer).toBeVisible();
    
    // Test Contact link from About page footer
    const contactLink = footer.locator('a[href="/contact"]');
    await expect(contactLink).toBeVisible();
    await contactLink.click();
    await expect(page).toHaveURL('/contact');
    await expect(page).toHaveTitle(/Contact us/);
    
    // Verify contact page content loads
    await expect(page.locator('img[src="/images/contactus.jpeg"]')).toBeVisible();
    
    // Test Privacy Policy link from Contact page footer
    const policyLink = footer.locator('a[href="/policy"]');
    await expect(policyLink).toBeVisible();
    await policyLink.click();
    await expect(page).toHaveURL('/policy');
    await expect(page).toHaveTitle(/Privacy Policy/);
    
    // Navigate back to home using brand logo to test complete navigation flow
    await page.click('.navbar-brand');
    await expect(page).toHaveURL('/');
    await expect(footer).toBeVisible();
  });

  test('Footer - Visual Layout and Spacing Consistency', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    
    // Verify footer links are properly separated (with separators)
    const footerText = await footer.textContent();
    expect(footerText).toMatch(/About.*\|.*Contact.*\|.*Privacy Policy/);
    
    // Verify footer is positioned correctly
    const footerPosition = await footer.boundingBox();
    expect(footerPosition).toBeTruthy();
  });

  test('Footer - Copyright Year and Company Information', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    
    // Verify complete copyright text
    const copyrightText = footer.locator('h4');
    await expect(copyrightText).toContainText('All Rights Reserved © TestingComp');
    
    // Verify copyright symbol is present
    await expect(footer).toContainText('©');
    
    // Verify company name is correctly spelled
    await expect(footer).toContainText('TestingComp');
  });

  test('Footer - Responsive Footer Layout', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1200, height: 800, name: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      const footer = page.locator('.footer');
      await expect(footer).toBeVisible();
      
      // Links should remain clickable and visible
      const aboutLink = footer.locator('a[href="/about"]');
      await expect(aboutLink).toBeVisible();
      
      // Test that footer doesn't overflow
      const footerBox = await footer.boundingBox();
      expect(footerBox.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test('Footer - Link Hover States and Interactions', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    
    // Test footer links functionality
    const footerLinks = footer.locator('a');
    const linkCount = await footerLinks.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = footerLinks.nth(i);
      
      // Hover over link
      await link.hover();
      
      // Verify link is still functional after hover
      await expect(link).toBeVisible();
      
      // Links should have href attribute
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

});