#!/usr/bin/env node
/**
 * Visual review sweep: full-page screenshots of key routes at several widths in both colour schemes,
 * reporting console errors, page errors and horizontal overflow.
 *
 * Usage: node scripts/screenshots.mjs --base-url=http://localhost:3000 --out=./screenshots
 */
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const arg = (name, fallback) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;
const base = arg("base-url", "http://localhost:3000").replace(/\/$/, "");
const out = arg("out", "./screenshots");
mkdirSync(out, { recursive: true });

const plan = [
  ["/", 390, "light"],
  ["/", 390, "dark"],
  ["/", 768, "light"],
  ["/", 1280, "light"],
  ["/", 1280, "dark"],
  ["/projects", 1280, "light"],
  ["/projects?pillar=backend&tech=nodejs", 390, "dark"],
  ["/projects/clinical-performance-optimization", 1280, "light"],
  ["/projects/this-portfolio", 390, "light"],
  ["/about", 1280, "dark"],
  ["/about", 390, "light"],
  ["/writing/building-this-portfolio", 1280, "dark"],
  ["/resume", 1280, "light"],
  ["/contact", 390, "light"],
  ["/contact", 1280, "dark"],
  ["/api/docs", 1280, "light"],
];

const browser = await chromium.launch();
const problems = [];
for (const [path, width, scheme] of plan) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: scheme,
    // Reduced motion disables the scroll-driven reveals so a full-page capture shows every section.
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const label = `${path} @${width} ${scheme}`;
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`${label}: console error: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`${label}: page error: ${error.message}`));
  const response = await page.goto(base + path, { waitUntil: "networkidle" });
  if (response?.status() !== 200) problems.push(`${label}: status ${response?.status()}`);
  await page.waitForTimeout(400);
  const name = `${path.replace(/[/?=&]+/g, "_").replace(/^_|_$/g, "") || "home"}-${width}-${scheme}.png`;
  await page.screenshot({ path: `${out}/${name}`, fullPage: true });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  if (overflow) problems.push(`${label}: horizontal overflow`);
  await context.close();
}
await browser.close();
console.log(
  problems.length
    ? problems.join("\n")
    : `No console errors, page errors or horizontal overflow across ${plan.length} screenshots.`,
);
process.exitCode = problems.length ? 1 : 0;
