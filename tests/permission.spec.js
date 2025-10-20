import test, { expect } from "@playwright/test";
import { loginUser, registerUser } from "./helpers";

test.describe.configure({ mode: "parallel" });

const DASHBOARD_LINK = "http://localhost:3000/dashboard/user";
const ADMIN_DASHBOARD_LINK = "http://localhost:3000/dashboard/admin";

test.describe("Permission UI Tests", () => {
  test("logged out users cannot see a dashboard", async ({ page }) => {
    await page.goto(DASHBOARD_LINK);

    // wait for 4 seconds to ensure any redirects happen
    await page.waitForTimeout(4000);
    await test.expect(page).toHaveURL("http://localhost:3000");
  });

  test("newly registered users cannot see admin dashboard", async ({
    page,
  }) => {
    const email = await registerUser(page);

    await page.goto(ADMIN_DASHBOARD_LINK);

    // wait for 4 seconds to ensure any redirects happen
    await page.waitForTimeout(4000);

    // something doesn't seem right about this
    await test.expect(page).toHaveURL("http://localhost:3000");
  });

  test("logged out users cannot see admin dashboard", async ({ page }) => {
    const user = await registerUser(page);
    await page.waitForTimeout(4000);
    await page.goto(ADMIN_DASHBOARD_LINK);

    // wait for 4 seconds to ensure any redirects happen
    await page.waitForTimeout(2000);
    await test.expect(page).toHaveURL("http://localhost:3000/");

    await page.waitForTimeout(2000);
    // logout
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Logout" }).click();

    // wait for 1 second
    await page.waitForTimeout(1000);

    // try to access admin dashboard again
    await page.goto(ADMIN_DASHBOARD_LINK);

    // wait for 4 seconds to ensure any redirects happen
    await page.waitForTimeout(4000);
    await test.expect(page).toHaveURL("http://localhost:3000/login");
  });

  test("logged out users cannot see user dashboard", async ({ page }) => {
    const user = await registerUser(page);
    await page.waitForTimeout(1000);

    await page.goto(DASHBOARD_LINK);

    // wait for 4 seconds to ensure any redirects happen

    await test.expect(page).toHaveURL("http://localhost:3000/dashboard/user");

    // logout
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Logout" }).click();

    // try to access admin dashboard again
    await page.goto(DASHBOARD_LINK);

    // wait for 4 seconds to ensure any redirects happen
    await page.waitForTimeout(4000);
    await test.expect(page).toHaveURL("http://localhost:3000");
  });

  test("admin users can access admin dashboard", async ({ page }) => {
    // assume there is an admin user with these credentials
    const adminEmail = "admin@gmail.com";
    const adminPassword = "adminpw";

    await loginUser(page, adminEmail, adminPassword);

    await page.waitForTimeout(1000);
    await page.goto(ADMIN_DASHBOARD_LINK);

    // wait for 4 seconds to ensure any redirects happen
    await page.waitForTimeout(1000);
    await test.expect(page).toHaveURL(ADMIN_DASHBOARD_LINK);
  });
});

// test("new users can register and see a dashboard", async ({ page }) => {
//     const time = new Date().getTime();
//     const email = `TESTER-${time}@gmail.com`;
//     await page.goto("http://localhost:3000/");
//     await page.getByRole("link", { name: "Register" }).click();
//     await page.getByRole("textbox", { name: "Enter Your Name" }).click();
//     await page
//       .getByRole("textbox", { name: "Enter Your Name" })
//       .fill("test12345678");
//     await page.getByRole("textbox", { name: "Enter Your Email" }).click();
//     await page.getByRole("textbox", { name: "Enter Your Email" }).fill(email);
//     await page.getByRole("textbox", { name: "Enter Your Password" }).click();
//     await page
//       .getByRole("textbox", { name: "Enter Your Password" })
//       .fill("test1234");
//     await page.getByRole("textbox", { name: "Enter Your Phone" }).click();
//     await page.getByRole("textbox", { name: "Enter Your Phone" }).fill("1234");
//     await page.getByRole("textbox", { name: "Enter Your Address" }).click();
//     await page.getByRole("textbox", { name: "Enter Your Address" }).fill("1");
//     await page.getByRole("textbox", { name: "Enter Your Address" }).click();
//     await page
//       .getByRole("textbox", { name: "Enter Your Address" })
//       .fill("1234");
//     await page.getByPlaceholder("Enter Your DOB").fill("2025-10-07");
//     await page
//       .getByRole("textbox", { name: "What is Your Favorite sports" })
//       .click();
//     await page
//       .getByRole("textbox", { name: "What is Your Favorite sports" })
//       .fill("1234");
//     await page.getByRole("button", { name: "REGISTER" }).click();

//     // wait for 1s
//     await page.waitForTimeout(1000);
//     await page.getByRole("textbox", { name: "Enter Your Email" }).click();
//     await page.getByRole("textbox", { name: "Enter Your Email" }).fill(email);
//     await page.getByRole("textbox", { name: "Enter Your Password" }).click();
//     await page
//       .getByRole("textbox", { name: "Enter Your Password" })
//       .fill("test1234");
//     await page.getByRole("button", { name: "LOGIN" }).click();
//     await page.getByRole("button", { name: "test12345678" }).click();
//     await page.getByRole("link", { name: "Dashboard" }).click();

//     // expect page to have email, name, and phone number
//     await expect(
//       page.getByRole("heading", { name: "test12345678" })
//     ).toBeVisible();
//     await expect(page.getByRole("heading", { name: email })).toBeVisible();
//     await expect(
//       page.getByRole("heading", { name: "1234", exact: true })
//     ).toBeVisible();
//   });
