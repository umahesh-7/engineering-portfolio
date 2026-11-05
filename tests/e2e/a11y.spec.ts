import { test } from "@playwright/test";
import { expectNoSeriousA11yViolations, ROUTES } from "./helpers";

for (const route of ROUTES) {
  test(`${route} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    await expectNoSeriousA11yViolations(page);
  });
}

test("dark theme has no serious or critical accessibility violations on the home page", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expectNoSeriousA11yViolations(page);
});
