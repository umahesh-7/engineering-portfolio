import { expect, test } from "@playwright/test";

test("filters update the URL and the result count", async ({ page }) => {
  await page.goto("/projects");
  const status = page.getByRole("status");
  await expect(status).toContainText("Showing 6 of 6");
  await page.getByRole("button", { name: "Platform and operations" }).click();
  await expect(page).toHaveURL(/pillar=platform/);
  await expect(status).toContainText("of 6 case studies matching");
  await page.getByRole("button", { name: "Kubernetes" }).click();
  await expect(page).toHaveURL(/tech=kubernetes/);
  await expect(status).toContainText("Showing 1 of 6");
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page).not.toHaveURL(/pillar=/);
  await expect(status).toContainText("Showing 6 of 6");
});

test("a shared filter URL preselects the filters", async ({ page }) => {
  await page.goto("/projects?pillar=backend");
  await expect(page.getByRole("button", { name: "Backend", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("status")).toContainText("matching the selected filters");
});

test("filters are keyboard operable", async ({ page }) => {
  await page.goto("/projects");
  const chip = page.getByRole("button", { name: "UI engineering" });
  await chip.focus();
  await page.keyboard.press("Enter");
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/pillar=ui/);
});

test("a case study shows its metrics with a basis and a table of contents", async ({
  page,
  isMobile,
}) => {
  await page.goto("/projects/clinical-performance-optimization");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("performance optimization");
  await expect(page.getByText("As stated on the résumé and LinkedIn").first()).toBeVisible();
  if (!isMobile) {
    await expect(page.getByRole("navigation", { name: "On this page" })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Related case studies" })).toBeVisible();
});
