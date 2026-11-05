import { expect, test } from "@playwright/test";

test("home renders the hero, pillars and featured case studies", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Three disciplines, one accountable engineer" }),
  ).toBeVisible();
  await expect(page.locator('article a[href^="/projects/"]').first()).toBeAttached();
  await expect(page.getByRole("link", { name: "Read the case studies" })).toBeVisible();
});

test("primary navigation reaches every section and marks the current page", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page
      .getByRole("navigation", { name: "Mobile" })
      .getByRole("link", { name: "About" })
      .click();
  } else {
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "About" })
      .click();
  }
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { level: 1, name: "Mahesh Utlapalli" })).toBeVisible();
  if (!isMobile) {
    await expect(
      page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "About" }),
    ).toHaveAttribute("aria-current", "page");
  }
});

test("skip link is the first focusable element and targets main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("theme toggle switches between light and dark", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /Switch to dark theme/ });
  await toggle.click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: /Switch to light theme/ })).toBeVisible();
});

test("unknown routes render the branded 404", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});
