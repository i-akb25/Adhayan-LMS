const { test, expect } = require("@playwright/test");
test("student registers, enrols, studies, takes a test and restores saved progress", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/register", { waitUntil: "domcontentloaded" });
  await page.locator('input[name="name"]').fill("Browser Learner");
  await page
    .locator('input[name="email"]')
    .fill(`browser${Date.now()}@example.test`);
  await page.locator('input[name="phone"]').fill("9999999999");
  await page.locator('input[name="password"]').fill("TestOnlyPassword123!");
  await page
    .locator('input[name="confirmPassword"]')
    .fill("TestOnlyPassword123!");
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Create Account", exact: true })
    .click();
  await expect(page).toHaveURL(/student\/dashboard/);
  await expect(
    page.getByRole("heading", { name: "E2E Algebra", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Enrol", exact: true }).click();
  await page.getByRole("link", { name: "Open course", exact: true }).click();
  await page.getByRole("button", { name: /Linear equations/ }).click();
  await expect(
    page.getByText("Therefore x = 3.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "My notes" })
    .fill("Subtract two from both sides.");
  await page
    .getByRole("button", { name: "Mark complete", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /Linear equations/ }),
  ).toContainText("Completed");
  await page.goto("/diagnostic-test");
  await page.getByRole("button", { name: "Start / resume" }).click();
  await page.getByRole("radio", { name: "3", exact: true }).check();
  await page.getByRole("button", { name: "Submit test", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Result: 4 / 4" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "View result" }).click();
  await expect(
    page.getByRole("heading", { name: "Result: 4 / 4" }),
  ).toBeVisible();
  await page.goto("/analytics", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByText("Tests completed: 1 · Lessons completed: 1"),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("adhayan_access_token")),
  ).toBeNull();
  expect(errors).toEqual([]);
});
test("existing public and demo screens render without runtime exceptions", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("body")).toContainText("ADHAYAN");
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Student/ }).click();
  await expect(page).toHaveURL(/student\/dashboard/);
  for (const path of [
    "/diagnostic-test",
    "/study-materials",
    "/settings",
    "/ai-mentor",
    "/global-study-hall",
    "/live-class/demo",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("status")).toContainText(/Demonstration/);
  }
  expect(errors).toEqual([]);
});
