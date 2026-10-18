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
  await page.goto("/settings");
  const accountDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download my account data", exact: true })
    .click();
  expect((await accountDownload).suggestedFilename()).toBe(
    "adhayan-account.json",
  );
  await page.getByText("Delete my account", { exact: true }).click();
  await page.locator('input[name="password"]').fill("TestOnlyPassword123!");
  await page
    .getByRole("textbox", { name: "Type DELETE MY ACCOUNT", exact: true })
    .fill("DELETE MY ACCOUNT");
  await page
    .getByRole("button", { name: "Permanently delete account", exact: true })
    .click();
  await expect(page).toHaveURL("/");
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

test("teacher imports, reviews, publishes and uploads private course material", async ({
  page,
}) => {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill("teacher@example.test");
  await page.locator('input[name="password"]').fill("TestOnlyPassword123!");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL(/teacher\/dashboard/);
  await page.getByText("Import a sourced curriculum", { exact: true }).click();
  await page
    .locator('input[name="package"]')
    .setInputFiles(
      require("node:path").join(
        __dirname,
        "../../client/public/content/algebra-foundations.json",
      ),
    );
  await page
    .getByRole("button", { name: "Import as draft", exact: true })
    .click();
  await expect(page).toHaveURL(/\/learn\/[a-f0-9]{24}/);
  await page
    .getByText("Review and edit course content", { exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Algebra foundations.*Review required/ }),
  ).toBeVisible();
  await page
    .getByRole("checkbox", { name: /I checked the lesson content/ })
    .check();
  await page
    .getByRole("button", { name: "Approve content review", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Algebra foundations.*Reviewed/ }),
  ).toBeVisible();
  await page
    .getByText("Linear equations practice · Draft", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Publish assessment", exact: true })
    .click();
  await expect(
    page.getByText("Linear equations practice · Published", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "File title", exact: true })
    .fill("Equation reference");
  await page.locator('input[name="file"]').setInputFiles({
    name: "equations.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\nEducational test file\n%%EOF"),
  });
  await page
    .getByRole("button", { name: "Upload private file", exact: true })
    .click();
  const file = page.getByRole("button", {
    name: "Download equations.pdf",
    exact: true,
  });
  await expect(file).toBeVisible();
  const downloading = page.waitForEvent("download");
  await file.click();
  const downloaded = await downloading;
  expect(downloaded.suggestedFilename()).toBe("equations.pdf");
  await page.screenshot({
    path: test.info().outputPath("course-review.png"),
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Back to learning", exact: true })
    .click();
  const card = page.locator("article").filter({
    has: page.getByRole("heading", {
      name: "Algebra foundations: linear equations",
      exact: true,
    }),
  });
  // Earlier projects leave reviewed drafts in the isolated test database.
  await card
    .first()
    .getByRole("button", { name: "Publish", exact: true })
    .click();
  await expect(card.first()).toContainText("Published");
});

test("student submits a private attachment, teacher grades it, and class links open the right room", async ({
  page,
  browser,
}) => {
  const name = `Workflow Learner ${test.info().project.name}`;
  const chatContent = `Browser workflow message ${test.info().project.name}.`;
  const studentContext = await browser.newContext({
    baseURL: "http://localhost:5173",
    viewport: page.viewportSize() || undefined,
  });
  const student = await studentContext.newPage();
  const errors = [];
  student.on("pageerror", (e) => errors.push(e.message));
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    const registered = await studentContext.request.post(
      "http://localhost:5173/api/auth/register",
      {
        headers: { Origin: "http://localhost:5173" },
        data: {
          name,
          email: `workflow-${test.info().project.name}-${Date.now()}@example.test`,
          password: "TestOnlyPassword123!",
          role: "Student",
          consent: true,
          profileData: { class: "11", target: "JEE" },
        },
      },
    );
    expect(registered.status()).toBe(201);
    await student.goto("/learn");
    const course = student.locator("article").filter({
      has: student.getByRole("heading", { name: "E2E Algebra", exact: true }),
    });
    await course.getByRole("button", { name: "Enrol", exact: true }).click();
    await student.goto("/assignments");
    await student
      .getByRole("combobox", { name: "Course", exact: true })
      .selectOption({ label: "E2E Algebra" });
    await student
      .getByText("Attach private files (optional)", { exact: true })
      .click();
    await student
      .getByLabel("Assignment attachment", { exact: true })
      .setInputFiles({
        name: "solution.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4\nStudent browser work\n%%EOF"),
      });
    await student
      .getByRole("button", {
        name: "Upload assignment attachment",
        exact: true,
      })
      .click();
    await student
      .getByRole("checkbox", { name: "Include solution.pdf", exact: true })
      .check();
    await student
      .getByRole("textbox", { name: "My submission", exact: true })
      .fill("Subtract two from each side, so x = 3.");
    await student
      .getByRole("button", { name: "Submit assignment", exact: true })
      .click();
    await expect(
      student.getByText("Awaiting review", { exact: true }),
    ).toBeVisible();
    await page.goto("/login");
    await page.locator('input[name="email"]').fill("teacher@example.test");
    await page.locator('input[name="password"]').fill("TestOnlyPassword123!");
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await expect(page).toHaveURL(/teacher\/dashboard/);
    await page.goto("/assignments");
    await page
      .getByRole("combobox", { name: "Course", exact: true })
      .selectOption({ label: "E2E Algebra" });
    await page
      .getByRole("button", { name: "Review submissions", exact: true })
      .click();
    const review = page
      .locator("form")
      .filter({ has: page.getByRole("heading", { name, exact: true }) });
    await review
      .getByRole("spinbutton", { name: "Grade (0–100)", exact: true })
      .fill("88");
    await review
      .getByRole("textbox", { name: "Feedback", exact: true })
      .fill("Clear method.");
    const downloading = page.waitForEvent("download");
    await review
      .getByRole("button", { name: "Download student attachment", exact: true })
      .click();
    expect((await downloading).suggestedFilename()).toBe("solution.pdf");
    await review
      .getByRole("button", { name: "Save review", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Review saved.");
    await student.reload();
    await student
      .getByRole("combobox", { name: "Course", exact: true })
      .selectOption({ label: "E2E Algebra" });
    await expect(
      student.getByText("Grade: 88/100", { exact: true }),
    ).toBeVisible();
    await expect(
      student.getByText("Clear method.", { exact: true }),
    ).toBeVisible();
    await student.goto("/classes");
    await student
      .getByRole("combobox", { name: "Course", exact: true })
      .selectOption({ label: "E2E Algebra" });
    const calendar = student.waitForEvent("download");
    await student
      .getByRole("button", { name: "Download calendar event", exact: true })
      .click();
    expect((await calendar).suggestedFilename()).toBe("adhayan-class.ics");
    await student
      .getByRole("link", { name: "Open class room", exact: true })
      .click();
    await expect(student).toHaveURL(/study-room\/[a-f0-9]{24}/);
    await expect(
      student.getByRole("heading", { name: "E2E Live", exact: true }).last(),
    ).toBeVisible();
    await student
      .getByRole("textbox", { name: "Message", exact: true })
      .fill(chatContent);
    await student.getByRole("button", { name: "Send", exact: true }).click();
    const message = student
      .locator("article")
      .filter({ hasText: chatContent })
      .last();
    await message.getByText("Report message", { exact: true }).click();
    await message
      .getByRole("textbox", { name: "Reason for report", exact: true })
      .fill("Test report for operator review.");
    await message
      .getByRole("button", { name: "Send report", exact: true })
      .click();
    await expect(student.getByRole("status")).toContainText("Report submitted");
    await student.screenshot({
      path: test.info().outputPath("scheduled-room.png"),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  } finally {
    await studentContext.close();
  }
});
