import { test, expect } from "@playwright/test";
import { loginUser } from "./helpers";

const BASE_URL = "http://localhost:3000";

test.describe.parallel("Search Feature", () => {

  // Clicking search with empty input does nothing
  test("clicking search with empty input does nothing", async ({ page }) => {
    await page.goto(BASE_URL);

    const searchBox = page.getByRole("searchbox", { name: "Search" });
    const searchButton = page.getByRole("button", { name: "Search" });

    // Save initial state
    const initialURL = page.url();
    const results = page.locator(".card.m-2");
    await expect(results.first()).toBeVisible({ timeout: 10000 });
    const initialProductCount = await page.locator(".card.m-2").count();
    const initialSearchValue = await searchBox.inputValue();

    // Trigger search with empty input
    await searchBox.click();
    await searchButton.click();

    // Check that URL didn't change
    await expect(page).toHaveURL(initialURL);

    // Check that search input is unchanged
    expect(await searchBox.inputValue()).toBe(initialSearchValue);

    // Check that products count is unchanged
    expect(await page.locator(".card.m-2").count()).toBe(initialProductCount);

  });



  // Searching with random text returns no results
  test("searching with random text returns no products found", async ({ page }) => {
    await page.goto(BASE_URL);
    const searchBox = page.getByRole("searchbox", { name: "Search" });

    await searchBox.fill("osjefnowen");
    await searchBox.press("Enter");

    await expect(page.getByText(/No Products Found/i)).toBeVisible({ timeout: 10000 });
  });

  // Valid text returns relevant search results
  test("searching with valid text shows relevant products", async ({ page }) => {
    await page.goto(BASE_URL);
    const searchBox = page.getByRole("searchbox", { name: "Search" });

    await searchBox.fill("book");
    await searchBox.press("Enter");

    const searchResultsHeading = page.getByText("Search Results");
    await expect(searchResultsHeading).toBeVisible({ timeout: 10000 });

    const results = page.locator(".card.m-2");

    // Check product info contains the keyword
    const firstResultText = await results.first().textContent();
    expect(firstResultText?.toLowerCase()).toContain("book");
  });

  // Logged-in user searches for a valid product
  test("logged-in user can search for products", async ({ page }) => {
    const testUser = { email: "user@gmail.com", password: "password", name: "user" };
    await loginUser(page, testUser.email, testUser.password);
    await page.goto(BASE_URL);
    const searchBox = page.getByRole("searchbox", { name: "Search" });

    await searchBox.fill("book");
    await searchBox.press("Enter");

    const searchResultsHeading = page.getByText("Search Results");
    await expect(searchResultsHeading).toBeVisible({ timeout: 10000 });

    const results = page.locator(".card.m-2");
    
    const firstResultText = await results.first().textContent();
    expect(firstResultText?.toLowerCase()).toContain("book");
  });
});
