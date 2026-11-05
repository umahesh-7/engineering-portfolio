#!/usr/bin/env node
/**
 * Public output leak check.
 *
 * Starts the production server (or targets --base-url), fetches the public JSON API and every page in
 * the sitemap, and fails when the output contains anything outside the published allowlist, contact
 * data, academic scores, security-finding vocabulary or work-authorization statements. Owner-specific
 * strings never live in this file: supply them through LEAK_CHECK_PRIVATE_PATTERNS (one regular
 * expression source per line), for example as a CI secret. Runs in CI after `next build`.
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

function privatePatterns() {
  const raw = process.env.LEAK_CHECK_PRIVATE_PATTERNS;
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((source, index) => ({
      name: `private pattern ${index + 1}`,
      regex: new RegExp(source, "i"),
    }));
}

/** Generic patterns that must not appear anywhere in public output. */
export const FORBIDDEN_PATTERNS = [
  {
    name: "phone number",
    regex: /(?:\+?1[\s.-]{0,2})?\(?\b\d{3}\)?[\s.-]{0,2}\d{3}[\s.-]{0,2}\d{4}\b/,
  },
  {
    name: "email address",
    regex:
      /[\w.+-]+@(?!font-face|media|keyframes|layer|supports|import|theme|custom-variant|apply)[\w-]+\.[a-z]{2,}/i,
  },
  { name: "academic score", regex: /\bGPA\b|\b[0-4]\.\d{1,2}\s*\/\s*4(?:\.0)?\b/i },
  {
    name: "security finding vocabulary",
    regex: /\bvulnerab\w*|\binjection\b|\bexploit\w*|\bCVE-\d+/i,
  },
  { name: "work authorization", regex: /\bvisas?\b|work authori[sz]ation|\bsponsorship\b/i },
  ...privatePatterns(),
];

const API_PAGES = ["/api/v1/openapi.json", "/feed.xml", "/robots.txt", "/manifest.webmanifest"];

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

async function isListening(url) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(1500) });
    return true;
  } catch {
    return false;
  }
}

async function waitFor(url, timeoutMs, child) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (child.exitCode !== null) throw new Error(`Server exited early with code ${child.exitCode}`);
    if (await isListening(url)) return;
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
  for (const project of projects.data ?? []) {
    checkProject(`/api/v1/projects#${project.slug}`, project);
    const single = await fetch(`${baseUrl}/api/v1/projects/${project.slug}`);
    const text = await single.text();
    checkText(`/api/v1/projects/${project.slug}`, text);
    checkProject(`/api/v1/projects/${project.slug}`, JSON.parse(text));
  }

  for (const path of API_PAGES) {
    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) fail(`GET ${path} responded ${response.status}`);
    checkText(path, await response.text());
  }

  const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
  if (!sitemapResponse.ok) fail(`GET /sitemap.xml responded ${sitemapResponse.status}`);
  const sitemap = await sitemapResponse.text();
  const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1]).pathname,
  );
  if (pages.length === 0) fail("/sitemap.xml lists no pages");
  for (const path of pages) {
    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) fail(`GET ${path} responded ${response.status}`);
    checkText(path, await response.text());
  }

  if (process.exitCode) {
    console.error("Public output leak check failed.");
  } else {
    console.log(
      `✔ Public output leak check passed (${(projects.data ?? []).length} projects, ${pages.length} pages, ${FORBIDDEN_PATTERNS.length} patterns).`,
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
  if (await isListening(`${baseUrl}/api/health`)) {
    throw new Error(`Port ${port} is already in use; stop that server or set CHECK_PORT.`);
  }
  const server = spawn("pnpm", ["exec", "next", "start", "-p", port], {
    stdio: ["ignore", "ignore", "inherit"],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  try {
    await waitFor(`${baseUrl}/api/health`, 60_000, server);
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
