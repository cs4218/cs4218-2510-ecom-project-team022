export async function registerUser(page, email = null, login = true) {
  const time = new Date().getTime();
  email = email || `TESTER-${time}@gmail.com`;
  const name = "test12345678";
  const phone = "1234567890";
  const address = "123 Test St";
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Enter Your Name" }).click();
  await page.getByRole("textbox", { name: "Enter Your Name" }).fill(name);
  await page.getByRole("textbox", { name: "Enter Your Email" }).click();
  await page.getByRole("textbox", { name: "Enter Your Email" }).fill(email);
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("test1234");
  await page.getByRole("textbox", { name: "Enter Your Phone" }).click();
  await page.getByRole("textbox", { name: "Enter Your Phone" }).fill(phone);
  await page.getByRole("textbox", { name: "Enter Your Address" }).click();

  await page.getByRole("textbox", { name: "Enter Your Address" }).fill(address);
  await page.getByPlaceholder("Enter Your DOB").fill("2025-10-07");
  await page
    .getByRole("textbox", { name: "What is Your Favorite sports" })
    .click();
  await page
    .getByRole("textbox", { name: "What is Your Favorite sports" })
    .fill("1234");
  await page.getByRole("button", { name: "REGISTER" }).click();
  // wait for 1s
  await page.waitForTimeout(1000);

  if (login) await loginUser(page, email, "test1234");

  return { email, name, phone, address };
}

export async function loginUser(page, email, password) {
  await page.goto("http://localhost:3000/login");
  await page.waitForTimeout(1000);
  await page.getByRole("textbox", { name: "Enter Your Email" }).click();
  await page.getByRole("textbox", { name: "Enter Your Email" }).fill(email);
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill(password);
  await page.getByRole("button", { name: "LOGIN" }).click();
}
