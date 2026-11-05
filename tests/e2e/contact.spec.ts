import { expect, test } from "@playwright/test";

test("contact form validates on the client", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
  await expect(page.getByLabel("Name")).toHaveAttribute("aria-invalid", "true");
});

test("contact form submits through the server action", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name").fill("Playwright Tester");
  await page.getByLabel("Email").fill("tester@example.com");
  await page
    .getByLabel("Message")
    .fill("This is an end-to-end test message from the automated suite.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status").filter({ hasText: /Thanks, your message/ })).toBeVisible({
    timeout: 15_000,
  });
});
