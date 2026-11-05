import { expect, test } from "@playwright/test";

test("résumé prints without navigation and without contact details", async ({ page }) => {
  await page.goto("/resume");
  const html = await page.content();
  expect(html).not.toMatch(/\b838\b[\s.-]*900[\s.-]*9067/);
  expect(html).not.toMatch(/\bGPA\b/);
  await expect(page.getByRole("heading", { level: 1, name: "Mahesh Utlapalli" })).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("button", { name: "Print or save as PDF" })).toBeHidden();
  await expect(page.getByRole("banner")).toBeHidden();
});
