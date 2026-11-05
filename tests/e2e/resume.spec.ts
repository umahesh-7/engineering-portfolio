import { expect, test } from "@playwright/test";

test("résumé prints without navigation and without contact details", async ({ page }) => {
  await page.goto("/resume");
  const html = await page.content();
  expect(html).not.toMatch(/(?:\+?1[\s.-]{0,2})?\(?\b\d{3}\)?[\s.-]{0,2}\d{3}[\s.-]{0,2}\d{4}\b/);
  expect(html).not.toMatch(/\bGPA\b/);
  await expect(page.getByRole("heading", { level: 1, name: "Mahesh Utlapalli" })).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("button", { name: "Print or save as PDF" })).toBeHidden();
  await expect(page.getByRole("banner")).toBeHidden();
});
