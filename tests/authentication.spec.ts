import { test, expect } from "@playwright/test";
import { loginUser, registerUser } from "./helpers";

test.describe.configure({ mode: "parallel" });

const DASHBOARD_LINK = "http://localhost:3000/dashboard/user";
const ADMIN_DASHBOARD_LINK = "http://localhost:3000/dashboard/admin";

test.describe("Login/Register/Logout Tests", () => {
  test("already registered user registering again gives error toast", async ({
    page,
  }) => {
    const user1 = await registerUser(page, null, false);
    await page.waitForTimeout(4000);
    await registerUser(page, user1.email, false);

    // expect there to be text that says "already register"
    await expect(page.getByText("Already Register")).toBeVisible();
  });

  test("new user registering shows success toast", async ({ page }) => {
    await registerUser(page, null, false);

    // expect there to be text that says "Registration Successful"
    await expect(page.getByText("Register Successfully")).toBeVisible();
  });

  test("login success redirects to /", async ({ page }) => {
    await registerUser(page);
    await expect(page).toHaveURL("http://localhost:3000/");
  });

  test("incorrect login gives error toast", async ({ page }) => {
    const { email, name } = await registerUser(page, null, false);
    await loginUser(page, email, "wrongpassword");
    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("incorrect email gives error toast", async ({ page }) => {
    await loginUser(page, "wrongemail@gmail.com", "userpw");
    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("logging out works", async ({ page }) => {
    const { name, email } = await registerUser(page);
    // check to make sure we're logged in by prescence of "name"
    await expect(page.getByRole("button", { name: name })).toBeVisible();

    // click logout
    await page.getByRole("button", { name: name }).click();
    await page.getByRole("link", { name: "Logout" }).click();

    // expect to be logged out by prescence of "Login" link
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  });
});
