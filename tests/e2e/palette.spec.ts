import { expect, test } from "@playwright/test";

test("command palette opens with the keyboard shortcut and navigates", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "keyboard shortcut is a desktop affordance");
  await page.goto("/");
  await page.keyboard.press("ControlOrMeta+k");
  const input = page.getByPlaceholder("Search pages, case studies and writing…");
  await expect(input).toBeVisible();
  await input.fill("résumé");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/resume$/);
});

test("command palette lists case studies", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /command palette/ })
    .first()
    .click();
  await page.getByPlaceholder("Search pages, case studies and writing…").fill("kubernetes");
  await expect(page.getByRole("option", { name: /Docker and Kubernetes/ })).toBeVisible();
});
