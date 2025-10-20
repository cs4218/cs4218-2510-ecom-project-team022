import seedDB from "./scripts/seedDB.js";

export default async function globalSetup() {
  console.log("Running database seed for Playwright tests...");
  await seedDB();
}
