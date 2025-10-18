import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test.describe("Navigation Flow and User Journey UI Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("Cross-Page Navigation - Complete User Journey Flow", async ({
    page,
  }) => {
    // Start at homepage and verify initial state
    await expect(page).toHaveURL("/");
    await expect(page.locator(".navbar-brand")).toContainText("Virtual Vault");

    // Simulate user clicking on different navigation elements
    // Test login link first
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL("/login");
    await expect(page.locator('h4:has-text("LOGIN FORM")')).toBeVisible();

    // User decides to register instead
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL("/register");
    await expect(page.locator('h4:has-text("REGISTER FORM")')).toBeVisible();

    // User wants to learn more about the company
    await page.click('.footer a[href="/about"]');
    await expect(page).toHaveURL("/about");
    // Verify about page loaded by checking for about image
    await expect(page.locator('img[src="/images/about.jpeg"]')).toBeVisible();

    // User wants to contact the company
    await page.click('.footer a[href="/contact"]');
    await expect(page).toHaveURL("/contact");
    await expect(page.locator('h1:has-text("CONTACT US")')).toBeVisible();

    // User checks privacy policy
    await page.click('.footer a[href="/policy"]');
    await expect(page).toHaveURL("/policy");
    await expect(page.locator('h1:has-text("Privacy Policy")')).toBeVisible();

    // User returns to shopping via brand logo
    await page.click(".navbar-brand");
    await expect(page).toHaveURL("/");

    // User checks their empty cart
    await page.click('a[href="/cart"]');
    await expect(page).toHaveURL("/cart");
    await expect(
      page.locator('h1:has-text("Your Cart Is Empty")')
    ).toBeVisible();

    // User returns to browse products
    await page.click(".navbar-brand");
    await expect(page).toHaveURL("/");
  });

  test("Header Navigation - Brand Logo and Menu Consistency", async ({
    page,
  }) => {
    // Test brand logo navigation from different pages
    const testPages = ["/about", "/contact", "/policy"];

    for (const testPage of testPages) {
      await page.goto(testPage);

      // Verify header is consistent
      const brandLogo = page.locator(".navbar-brand");

      // On mobile, might need to expand navbar first
      const hamburger = page.locator(".navbar-toggler");
      if (await hamburger.isVisible()) {
        await hamburger.click();
      }

      await expect(brandLogo).toBeVisible();
      await expect(brandLogo).toContainText("Virtual Vault");

      // Click brand to return home
      await brandLogo.click();
      await expect(page).toHaveURL("/");
    }
  });

  test("URL Direct Access - Deep Linking Functionality", async ({ page }) => {
    const directPages = [
      { url: "/about", expectedTitle: "About us - Ecommerce app" },
      { url: "/contact", expectedTitle: "Contact us" },
      { url: "/policy", expectedTitle: "Privacy Policy" },
    ];

    for (const pageInfo of directPages) {
      // Directly navigate to URL
      await page.goto(pageInfo.url);

      // Verify page loads correctly
      await expect(page).toHaveURL(pageInfo.url);
      await expect(page).toHaveTitle(new RegExp(pageInfo.expectedTitle));

      // Verify header and footer still work after direct access
      // On mobile, expand navbar if needed
      const hamburger = page.locator(".navbar-toggler");
      if (await hamburger.isVisible()) {
        await hamburger.click();
      }

      await expect(page.locator(".navbar-brand")).toBeVisible();
      await expect(page.locator(".footer")).toBeVisible();
    }
  });

  test("Navigation State Persistence - Page Refresh Behavior", async ({
    page,
  }) => {
    // Navigate to About page
    await page.goto("/about");
    await expect(page).toHaveURL("/about");

    // Refresh page
    await page.reload();

    // Verify we're still on the same page
    await expect(page).toHaveURL("/about");

    // Test navigation still works after refresh
    const contactLink = page.locator('.footer a[href="/contact"]');
    await expect(contactLink).toBeVisible();
    await contactLink.click();
    await expect(page).toHaveURL("/contact");
  });

  test("Error Recovery Navigation - 404 to Valid Page Flow", async ({
    page,
  }) => {
    // Navigate to non-existent page
    await page.goto("/this-page-does-not-exist");

    // Verify 404 page displays
    const error404Title = page.locator(
      '.page-not-found__title:has-text("404")'
    );
    await expect(error404Title).toBeVisible();

    // Use "Go Back" button to return to homepage
    const goBackButton = page.locator(
      '.page-not-found__btn:has-text("Go Back")'
    );
    await expect(goBackButton).toBeVisible();
    await goBackButton.click();

    // Verify we're back at homepage
    await expect(page).toHaveURL("/");

    // Verify normal navigation still works
    const aboutLink = page.locator('.footer a[href="/about"]');
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();
    await expect(page).toHaveURL("/about");
  });

  test("Multi-Tab Navigation - Consistent Behavior Across Tabs", async ({
    page,
    context,
  }) => {
    // Open second tab
    const page2 = await context.newPage();

    // Navigate to different pages in each tab
    await page.goto("/about");
    await page2.goto("/contact");

    // Verify both tabs have correct URLs
    await expect(page).toHaveURL("/about");
    await expect(page2).toHaveURL("/contact");

    // Test navigation in first tab
    const policyLink = page.locator('.footer a[href="/policy"]');
    await expect(policyLink).toBeVisible();
    await policyLink.click();
    await expect(page).toHaveURL("/policy");

    // Verify second tab is unaffected
    await expect(page2).toHaveURL("/contact");

    // Test brand navigation in second tab
    const brandLogo = page2.locator(".navbar-brand");

    // On mobile, might need to expand navbar first
    const hamburger2 = page2.locator(".navbar-toggler");
    if (await hamburger2.isVisible()) {
      await hamburger2.click();
    }

    await expect(brandLogo).toBeVisible();
    await brandLogo.click();
    await expect(page2).toHaveURL("/");

    await page2.close();
  });

  test("Browser History Navigation - Back/Forward Button Support", async ({
    page,
  }) => {
    // Navigate through several pages
    await page.goto("/");
    await page.goto("/about");
    await page.goto("/contact");
    await page.goto("/policy");

    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL("/contact");

    await page.goBack();
    await expect(page).toHaveURL("/about");

    await page.goBack();
    await expect(page).toHaveURL("/");

    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL("/about");

    await page.goForward();
    await expect(page).toHaveURL("/contact");
  });

  test("Navigation Performance - Page Load and Transition Speed", async ({
    page,
  }) => {
    // Measure initial page load
    const startTime = Date.now();
    await page.goto("/");
    const initialLoadTime = Date.now() - startTime;

    // Page should load within reasonable time (5 seconds)
    expect(initialLoadTime).toBeLessThan(5000);

    // Test navigation between pages
    const navStartTime = Date.now();
    const aboutLink = page.locator('.footer a[href="/about"]');
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();
    await expect(page).toHaveURL("/about");
    const navTime = Date.now() - navStartTime;

    // Navigation should be fast (under 3 seconds)
    expect(navTime).toBeLessThan(3000);

    // Verify page is fully loaded
    await page.waitForLoadState("networkidle");

    // On mobile, expand navbar if needed
    const hamburger = page.locator(".navbar-toggler");
    if (await hamburger.isVisible()) {
      await hamburger.click();
    }

    await expect(page.locator(".navbar-brand")).toBeVisible();
    await expect(page.locator(".footer")).toBeVisible();
  });
});
