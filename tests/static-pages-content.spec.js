import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test.describe("Static Pages Content and Layout UI Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("About Page - Content Verification and Navigation Flow", async ({
    page,
  }) => {
    // Navigate to About page via footer link (user interaction)
    await page.click('.footer a[href="/about"]');
    await expect(page).toHaveURL("/about");

    // Verify page title and content loaded correctly
    await expect(page).toHaveTitle(/About us/);

    // Verify image is present and loads properly
    const aboutImage = page.locator('img[src="/images/about.jpeg"]');
    await expect(aboutImage).toBeVisible();
    await expect(aboutImage).toHaveAttribute("alt", "about us");

    // Verify content structure and readability
    const contentContainer = page.locator(".row.about");
    await expect(contentContainer).toBeVisible();

    // Test navigation from About page to other pages
    await page.click('.footer a[href="/contact"]');
    await expect(page).toHaveURL("/contact");

    // Navigate back to About using footer
    await page.click('.footer a[href="/about"]');
    await expect(page).toHaveURL("/about");

    // Test home navigation using brand logo
    await page.click(".navbar-brand");
    await expect(page).toHaveURL("/");
  });

  test("Contact Page - Form Interaction and Content Verification", async ({
    page,
  }) => {
    // Navigate to Contact page via footer link
    await page.click('.footer a[href="/contact"]');
    await expect(page).toHaveURL("/contact");

    // Verify page title
    await expect(page).toHaveTitle(/Contact us/);

    // Verify contact image loads properly
    const contactImage = page.locator('img[src="/images/contactus.jpeg"]');
    await expect(contactImage).toBeVisible();
    await expect(contactImage).toHaveAttribute("alt", "contactus");

    // Verify contact information is displayed
    const infoContainer = page.locator(".col-md-6");
    await expect(infoContainer).toBeVisible();

    // Test navigation to other pages from Contact
    await page.click('.footer a[href="/policy"]');
    await expect(page).toHaveURL("/policy");

    // Navigate back to contact
    await page.click('.footer a[href="/contact"]');
    await expect(page).toHaveURL("/contact");
  });

  test("Privacy Policy Page - Content Structure and Legal Information", async ({
    page,
  }) => {
    // Navigate to Privacy Policy via footer link
    await page.click('.footer a[href="/policy"]');
    await expect(page).toHaveURL("/policy");

    // Verify page title
    await expect(page).toHaveTitle(/Privacy Policy/);

    // Verify privacy policy content is present
    const policyContainer = page.locator(".row.policy");
    await expect(policyContainer).toBeVisible();

    // Test that policy page has loaded with content
    await expect(policyContainer).toContainText("add privacy policy");

    // Test cross-navigation between static pages
    await page.click('.footer a[href="/about"]');
    await expect(page).toHaveURL("/about");

    await page.click('.footer a[href="/policy"]');
    await expect(page).toHaveURL("/policy");

    // Return to home
    await page.click(".navbar-brand");
    await expect(page).toHaveURL("/");
  });

  test("404 Page Not Found - Error Handling and Recovery Navigation", async ({
    page,
  }) => {
    // Navigate to non-existent page to trigger 404
    await page.goto("/this-page-does-not-exist");

    // Verify 404 page displays correctly
    const error404Title = page.locator(
      '.page-not-found__title:has-text("404")'
    );
    await expect(error404Title).toBeVisible();

    // Test "Go Back" button functionality
    const goBackButton = page.locator(
      '.page-not-found__btn:has-text("Go Back")'
    );
    await expect(goBackButton).toBeVisible();
    await goBackButton.click();

    // Should return to homepage
    await expect(page).toHaveURL("/");

    // Test that normal navigation works after 404 recovery
    await page.click('.footer a[href="/about"]');
    await expect(page).toHaveURL("/about");

    // Test another invalid URL and recovery
    await page.goto("/another-invalid-page");
    await expect(error404Title).toBeVisible();

    // Use brand logo to navigate home instead of Go Back button
    await page.click(".navbar-brand");
    await expect(page).toHaveURL("/");
  });

  test("Static Pages - Cross-Page Navigation and Consistency", async ({
    page,
  }) => {
    // Test complete navigation flow through all static pages
    const staticPages = [
      { url: "/about", title: /About us/ },
      { url: "/contact", title: /Contact us/ },
      { url: "/policy", title: /Privacy Policy/ },
    ];

    for (const pageInfo of staticPages) {
      // Navigate to each page via footer link
      await page.click(`.footer a[href="${pageInfo.url}"]`);
      await expect(page).toHaveURL(pageInfo.url);
      await expect(page).toHaveTitle(pageInfo.title);

      // Verify footer is consistent on all pages
      const footer = page.locator(".footer");
      await expect(footer).toBeVisible();
      await expect(footer).toContainText("All Rights Reserved © TestingComp");

      // Verify header is consistent on all pages
      const brandLogo = page.locator(".navbar-brand");
      await expect(brandLogo).toBeVisible();
      await expect(brandLogo).toContainText("Virtual Vault");
    }

    // Return to home and verify all navigation still works
    await page.click(".navbar-brand");
    await expect(page).toHaveURL("/");

    // Quick verification that all footer links are still functional
    await page.click('.footer a[href="/about"]');
    await expect(page).toHaveURL("/about");
    await page.click(".navbar-brand");
    await expect(page).toHaveURL("/");
  });

  test("Static Pages - SEO and Meta Information Verification", async ({
    page,
  }) => {
    const pagesWithSEO = [
      { url: "/about", expectedTitle: /About us - Ecommerce app/ },
      { url: "/contact", expectedTitle: /Contact us/ },
      { url: "/policy", expectedTitle: /Privacy Policy/ },
    ];

    for (const pageInfo of pagesWithSEO) {
      // Navigate to page
      await page.goto(pageInfo.url);

      // Verify page title is set correctly for SEO
      await expect(page).toHaveTitle(pageInfo.expectedTitle);

      // Verify page loads completely
      await page.waitForLoadState("networkidle");

      // Verify basic page structure is present
      await expect(page.locator(".footer")).toBeVisible();
      await expect(page.locator(".navbar-brand")).toBeVisible();
    }

    // Test that homepage also has proper SEO title
    await page.goto("/");
    await expect(page).toHaveTitle(/Best offers|Ecommerce app/);
  });
});
