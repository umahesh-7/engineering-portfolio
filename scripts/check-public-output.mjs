#!/usr/bin/env node
/**
 * Public output leak check.
 *
 * Starts the production server (or targets --base-url), fetches the public JSON API and key pages,
 * and fails when the output contains anything outside the published allowlist, contact data,
 * academic scores, or details that must never be public. Runs in CI after `next build`.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

/** Keys the projects API may expose. Mirrors publicProjectSchema in src/lib/schemas.ts (asserted by a unit test). */
export const PUBLIC_KEYS = [
  "slug",
  "title",
  "summary",
  "employer",
  "period",
  "primaryPillar",
  "pillars",
  "stack",
  "tags",
  "outcomes",
  "url",
  "publishedAt",
  "updatedAt",
];

/** Keys that are build-time controls or working notes and must never leave the repository. */
export const FORBIDDEN_KEYS = [
  "draft",
  "gate",
  "featured",
  "featuredRank",
  "order",
  "body",
  "readingMinutes",
  "sourceNote",
  "traceability",
  "rationale",
  "confidentiality_note",
  "confidentiality_risk",
  "needs_from_owner",
  "source_bullets",
];

/** Patterns that must not appear anywhere in public output. */
export const FORBIDDEN_PATTERNS = [
  { name: "phone number", regex: /\+?1?\s?\(?\b838\)?[\s.-]*900[\s.-]*9067\b/ },
  { name: "generic US phone number", regex: /\+1\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/ },
  {
    name: "email address",
    regex:
      /[\w.+-]+@(?!font-face|media|keyframes|layer|supports|import|theme|custom-variant|apply)[\w-]+\.[a-z]{2,}/i,
  },
  { name: "GPA", regex: /\bGPA\b|\b3\.55\b|\b3\.60\b/ },
  { name: "security audit detail", regex: /open redirect|content-disposition|header injection/i },
  { name: "work authorization", regex: /\bvisa\b|work authorization|sponsorship/i },
];

const PAGES = [
  "/",
  "/about",
  "/resume",
  "/projects",
  "/contact",
  "/api/docs",
  "/sitemap.xml",
  "/feed.xml",
];

function fail(message) {
  console.error(`✖ ${message}`);
  process.exitCode = 1;
}

function checkText(label, text) {
  for (const { name, regex } of FORBIDDEN_PATTERNS) {
    const match = regex.exec(text);
    if (match) fail(`${label}: contains ${name} (${JSON.stringify(match[0])})`);
  }
}

function checkProject(label, project) {
  for (const key of Object.keys(project)) {
    if (!PUBLIC_KEYS.includes(key))
      fail(`${label}: key "${key}" is outside the published allowlist`);
    if (FORBIDDEN_KEYS.includes(key)) fail(`${label}: forbidden key "${key}"`);
  }
}

async function waitFor(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 503) return;
    } catch {
      /* not ready yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server did not become ready at ${url} within ${timeoutMs}ms`);
}

export async function run(baseUrl) {
  const projectsResponse = await fetch(`${baseUrl}/api/v1/projects`);
  if (!projectsResponse.ok) fail(`GET /api/v1/projects responded ${projectsResponse.status}`);
  const projectsText = await projectsResponse.text();
  checkText("/api/v1/projects", projectsText);
  const projects = JSON.parse(projectsText);
  if (!Array.isArray(projects.data)) fail("/api/v1/projects: missing data array");
  for (const project of projects.data ?? [])
    checkProject(`/api/v1/projects#${project.slug}`, project);

  for (const project of projects.data ?? []) {
    const single = await fetch(`${baseUrl}/api/v1/projects/${project.slug}`);
    const text = await single.text();
    checkText(`/api/v1/projects/${project.slug}`, text);
    checkProject(`/api/v1/projects/${project.slug}`, JSON.parse(text));
    const page = await fetch(`${baseUrl}/projects/${project.slug}`);
    checkText(`/projects/${project.slug}`, await page.text());
  }

  const openapi = await fetch(`${baseUrl}/api/v1/openapi.json`);
  checkText("/api/v1/openapi.json", await openapi.text());

  for (const path of PAGES) {
    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) fail(`GET ${path} responded ${response.status}`);
    checkText(path, await response.text());
  }

  if (process.exitCode) {
    console.error("Public output leak check failed.");
  } else {
    console.log(
      `✔ Public output leak check passed (${(projects.data ?? []).length} projects, ${PAGES.length} pages).`,
    );
  }
}

async function main() {
  const argBase = process.argv.find((arg) => arg.startsWith("--base-url="))?.split("=")[1];
  if (argBase) {
    await run(argBase.replace(/\/$/, ""));
    return;
  }
  const port = process.env.CHECK_PORT ?? "3123";
  const baseUrl = `http://localhost:${port}`;
  const server = spawn("pnpm", ["exec", "next", "start", "-p", port], {
    stdio: ["ignore", "ignore", "inherit"],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  try {
    await waitFor(`${baseUrl}/api/health`, 60_000);
    await run(baseUrl);
  } finally {
    server.kill("SIGTERM");
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
