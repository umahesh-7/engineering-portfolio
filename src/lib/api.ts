import "server-only";

import { createHash } from "node:crypto";
import { basisText } from "@/components/site/metric";
import { getProjects } from "@/lib/content";
import { env } from "@/lib/env";
import { type Project, type PublicProject, publicProjectSchema } from "@/lib/schemas";

export const API_VERSION = "1";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, If-None-Match",
  "Access-Control-Expose-Headers": "ETag, Cache-Control, X-Api-Version",
  "Access-Control-Max-Age": "86400",
} as const;

export const PUBLIC_CACHE = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";

/** Projects the API publishes, reduced to the allowlisted shape and validated against it. */
export function toPublicProject(project: Project): PublicProject {
  return publicProjectSchema.parse({
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    employer: project.employer,
    period: project.period,
    primaryPillar: project.primaryPillar,
    pillars: project.pillars,
    stack: project.stack,
    tags: project.tags,
    outcomes: project.outcomes.map((metric) => ({
      value: metric.value,
      label: metric.label,
      hedge: metric.hedge,
      basis: basisText(metric.basis),
    })),
    url: `${env.NEXT_PUBLIC_SITE_URL}/projects/${project.slug}`,
    publishedAt: project.publishedAt,
    updatedAt: project.updatedAt,
  });
}

export function listPublicProjects(): PublicProject[] {
  return getProjects().map(toPublicProject);
}

export function etagFor(body: string): string {
  return `"${createHash("sha256").update(body).digest("base64url").slice(0, 27)}"`;
}

export interface JsonOptions {
  status?: number;
  cache?: string;
  etag?: string;
  headers?: Record<string, string>;
  /** Send CORS headers (default true). Off for same-origin-only writes. */
  cors?: boolean;
}

export function json(body: unknown, options: JsonOptions = {}): Response {
  const text = JSON.stringify(body);
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "X-Api-Version": API_VERSION,
    ...(options.cors === false ? {} : CORS_HEADERS),
    ...options.headers,
  });
  if (options.cache) headers.set("Cache-Control", options.cache);
  if (options.etag) headers.set("ETag", options.etag);
  return new Response(text, { status: options.status ?? 200, headers });
}

/** Serves a JSON body with an ETag and answers conditional requests with 304. */
export function conditionalJson(request: Request, body: unknown, cache = PUBLIC_CACHE): Response {
  const text = JSON.stringify(body);
  const etag = etagFor(text);
  const headers: Record<string, string> = {
    "Cache-Control": cache,
    ETag: etag,
    Vary: "Accept-Encoding",
    "X-Api-Version": API_VERSION,
    ...CORS_HEADERS,
  };
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(text, {
    status: 200,
    headers: {
      ...headers,
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function apiError(status: number, code: string, message: string): Response {
  return json({ error: { code, message } }, { status, cache: "no-store" });
}

export function preflight(
  methods: string = CORS_HEADERS["Access-Control-Allow-Methods"],
): Response {
  return new Response(null, {
    status: 204,
    headers: { ...CORS_HEADERS, "Access-Control-Allow-Methods": methods },
  });
}
