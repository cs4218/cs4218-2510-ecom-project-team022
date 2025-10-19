import { test, expect } from "@playwright/test";
import { loginUser, registerUser } from "./helpers";
import { register } from "module";

test.describe.configure({ mode: "parallel" });

test.describe("User tests", () => {
  test("registered user can login and see dashboard info", async ({ page }) => {
    const { name, email, phone, address } = await registerUser(page);

    // 1s
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();

    // expect name, email, phone get by text
    await expect(page.getByText(name)).toHaveCount(2);
    await expect(page.getByText(email as unknown as string)).toBeVisible();
    await expect(page.getByText(address)).toBeVisible();
  });

  test("new user's dashboard should have no orders", async ({ page }) => {
    const user = await registerUser(page);
    await page.getByRole("button", { name: user.name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByTestId("orders-link").click();

    // expect No Orders Found
    await expect(page.getByText("No Orders Found")).toBeVisible();
  });
  test("registered user can login and see detailed user info", async ({
    page,
  }) => {
    const { name, email, phone, address } = await registerUser(page);

    // 1s
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();

    await page.getByTestId("profile-link").click();

    // expect name, email, phone, address in the input fields
    await expect(
      page.getByRole("textbox", { name: "Enter Your Name" })
    ).toHaveValue(name);
    await expect(
      page.getByRole("textbox", { name: "Enter Your Email" })
    ).toHaveValue(email as unknown as string);
    await expect(
      page.getByRole("textbox", { name: "Enter Your Phone" })
    ).toHaveValue(phone);
    await expect(
      page.getByRole("textbox", { name: "Enter Your Address" })
    ).toHaveValue(address);
  });

  test("registered user can edit and update user info", async ({ page }) => {
    const { name, email } = await registerUser(page);

    // 1s
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();

    await page.getByTestId("profile-link").click();

    // change name and phone number
    const newName = name + "edited";
    const newPhone = "9876543210";
    await page.getByRole("textbox", { name: "Enter Your Name" }).fill(newName);
    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill(newPhone);
    await page.getByRole("button", { name: "UPDATE" }).click();

    // expect success toast
    await expect(page.getByText("Profile Updated Successfully")).toBeVisible();

    // reload page
    await page.reload();

    // expect updated name and phone number in the input fields
    await expect(
      page.getByRole("textbox", { name: "Enter Your Name" })
    ).toHaveValue(newName);
    await expect(
      page.getByRole("textbox", { name: "Enter Your Phone" })
    ).toHaveValue(newPhone);
  });
});
