import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const ROUTES = [
  "/",
  "/projects",
  "/projects/clinical-performance-optimization",
  "/projects/this-portfolio",
  "/about",
  "/writing",
  "/writing/building-this-portfolio",
  "/resume",
  "/contact",
  "/api/docs",
];

export async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  expect(
    serious.map(
      (violation) =>
        `${violation.id}: ${violation.help} (${violation.nodes.map((node) => node.target.join(" ")).join(", ")})`,
    ),
  ).toEqual([]);
}
