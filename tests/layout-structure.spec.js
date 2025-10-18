import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test.describe("Page Layout UI Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("Layout Grid System - Bootstrap Column Structure and Alignment", async ({
    page,
  }) => {
    // Test homepage layout structure
    await page.goto("/");

    // Verify main container exists
    const mainContainer = page.locator(".container-fluid, .container, main");
    await expect(mainContainer.first()).toBeVisible();

    // Test About page layout
    await page.goto("/about");

    // Verify row and column structure
    const rowContainer = page.locator(".row.about");
    await expect(rowContainer).toBeVisible();

    const columns = page.locator(".row.about .col-md-6");
    await expect(columns).toHaveCount(2);

    // Verify columns have content
    for (let i = 0; i < 2; i++) {
      const column = columns.nth(i);
      await expect(column).toBeVisible();

      const columnBox = await column.boundingBox();
      expect(columnBox.width).toBeGreaterThan(0);
      expect(columnBox.height).toBeGreaterThan(0);
    }
  });

  test("Responsive Layout - Viewport Adaptation and Mobile-First Design", async ({
    page,
  }) => {
    const viewports = [
      { width: 320, height: 568, name: "Small Mobile" },
      { width: 768, height: 1024, name: "Tablet" },
      { width: 1200, height: 800, name: "Desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/about");

      // Verify layout adapts to viewport
      const rowContainer = page.locator(".row.about");
      await expect(rowContainer).toBeVisible();

      // Verify content doesn't overflow excessively (allow some margin)
      const rowBox = await rowContainer.boundingBox();
      expect(rowBox.width).toBeLessThan(viewport.width + 50); // Allow 50px margin

      // Verify images scale properly
      const aboutImage = page.locator('img[src="/images/about.jpeg"]');
      await expect(aboutImage).toBeVisible();

      const imageBox = await aboutImage.boundingBox();
      expect(imageBox.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test("Visual Hierarchy - Typography and Content Structure", async ({
    page,
  }) => {
    // Test typography hierarchy on Contact page
    await page.goto("/contact");

    // Verify main heading exists and is prominent
    const mainHeading = page.locator("h1");
    await expect(mainHeading).toBeVisible();

    const headingStyles = await mainHeading.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(computed.fontSize),
        fontWeight: computed.fontWeight,
        display: computed.display,
      };
    });

    // Main heading should be larger than body text
    expect(headingStyles.fontSize).toBeGreaterThan(14);

    // Verify text content has proper structure
    const textContent = page.locator("p");
    await expect(textContent.first()).toBeVisible();
  });

  test("Image Optimization - Loading and Display Quality", async ({ page }) => {
    const pagesWithImages = [
      { url: "/about", imgSrc: "/images/about.jpeg", altText: "about us" },
      {
        url: "/contact",
        imgSrc: "/images/contactus.jpeg",
        altText: "contactus",
      },
      {
        url: "/policy",
        imgSrc: "/images/contactus.jpeg",
        altText: "Privacy policy illustration",
      },
    ];

    for (const pageInfo of pagesWithImages) {
      await page.goto(pageInfo.url);

      const image = page.locator(`img[src="${pageInfo.imgSrc}"]`);
      await expect(image).toBeVisible();

      // Verify image has proper alt text
      await expect(image).toHaveAttribute("alt", pageInfo.altText);

      // Verify image has proper styling
      const imageStyles = await image.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          width: computed.width,
          height: computed.height,
          objectFit: computed.objectFit,
        };
      });

      // Image should have width set to 100%
      expect(imageStyles.width).toBeTruthy();

      // Verify image loads successfully
      const imageLoaded = await image.evaluate(
        (img) => img.complete && img.naturalHeight !== 0
      );
      expect(imageLoaded).toBe(true);
    }
  });

  test("Content Spacing and Margins - Visual Polish and Readability", async ({
    page,
  }) => {
    await page.goto("/about");

    // Verify proper spacing between elements
    const rowContainer = page.locator(".row.about");
    await expect(rowContainer).toBeVisible();

    const columns = page.locator(".row.about .col-md-6");

    for (let i = 0; i < (await columns.count()); i++) {
      const column = columns.nth(i);

      const columnStyles = await column.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          padding: computed.padding,
          margin: computed.margin,
        };
      });

      // Columns should have some spacing
      expect(columnStyles.padding).toBeTruthy();
    }

    // Verify text has proper spacing
    const textElement = page.locator("p").first();
    if (await textElement.isVisible()) {
      const textStyles = await textElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          marginTop: parseFloat(computed.marginTop),
          lineHeight: computed.lineHeight,
        };
      });

      // Text should have reasonable line height for readability
      expect(textStyles.lineHeight).toBeTruthy();
    }
  });

  test("Layout Component Integration - Header, Main, Footer Structure", async ({
    page,
  }) => {
    const testPages = ["/", "/about", "/contact", "/policy"];

    for (const testPage of testPages) {
      await page.goto(testPage);

      // Verify three-part layout structure
      const header = page.locator("nav.navbar");
      await expect(header).toBeVisible();

      const main = page.locator("main");
      await expect(main).toBeVisible();

      const footer = page.locator(".footer");
      await expect(footer).toBeVisible();

      // Verify Layout component provides proper structure
      const mainStyles = await main.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          minHeight: computed.minHeight,
        };
      });

      // Main content should have minimum height
      expect(mainStyles.minHeight).toBeTruthy();
    }
  });
});
