import { z } from "zod";
import { env } from "@/lib/env";
import { publicProjectSchema } from "@/lib/schemas";

const errorSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});

const viewsSchema = z.object({
  slug: z.string(),
  views: z.number().int().nullable().describe("Null when view counting is disabled."),
});

const healthSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  version: z.string().describe("Git commit SHA of the deployment, or 'dev'."),
  time: z.string().describe("ISO 8601 timestamp of the check."),
  checks: z.object({ redis: z.enum(["ok", "disabled", "error"]) }),
});

const githubSchema = z.object({
  source: z.enum(["live", "unavailable"]),
  user: z.string(),
  repos: z.array(
    z.object({
      name: z.string(),
      description: z.string().nullable(),
      url: z.url(),
      language: z.string().nullable(),
      stars: z.number().int(),
      pushedAt: z.string(),
    }),
  ),
});

const projectsResponseSchema = z.object({
  data: z.array(publicProjectSchema),
  meta: z.object({ count: z.number().int(), version: z.string() }),
});

function schema(input: z.ZodType) {
  const result = z.toJSONSchema(input, {
    target: "draft-2020-12",
    unrepresentable: "any",
  }) as Record<string, unknown>;
  const { $schema: _ignored, ...rest } = result;
  return rest;
}

const kindParameter = {
  name: "kind",
  in: "path",
  required: true,
  schema: { type: "string", enum: ["projects", "posts"] },
  description: "Content collection.",
};

const slugParameter = {
  name: "slug",
  in: "path",
  required: true,
  schema: { type: "string" },
  description: "Case-study slug as it appears in the URL of the site.",
};

/** OpenAPI 3.1 document generated from the same Zod schemas that validate the content. */
export function getOpenApiDocument() {
  const base = env.NEXT_PUBLIC_SITE_URL;
  return {
    openapi: "3.1.0",
    info: {
      title: "Engineering portfolio API",
      version: "1.0.0",
      description:
        "Read-only JSON API over the published case studies, plus view counts, a GitHub activity feed and a health endpoint. Responses carry ETag and Cache-Control headers; send If-None-Match to receive 304 Not Modified. Every response is CORS-enabled for GET.",
      contact: { name: "Mahesh Utlapalli", url: `${base}/contact` },
      license: {
        name: "MIT (code); content all rights reserved",
        url: "https://github.com/umahesh-7/engineering-portfolio/blob/main/LICENSE",
      },
    },
    servers: [{ url: base }],
    tags: [
      { name: "projects", description: "Published case studies" },
      { name: "views", description: "Page view counts" },
      { name: "activity", description: "GitHub activity" },
      { name: "ops", description: "Operational endpoints" },
    ],
    paths: {
      "/api/v1/projects": {
        get: {
          tags: ["projects"],
          summary: "List published case studies",
          operationId: "listProjects",
          responses: {
            "200": {
              description: "The published case studies in display order.",
              headers: {
                ETag: {
                  schema: { type: "string" },
                  description: "Strong validator for conditional requests.",
                },
                "Cache-Control": { schema: { type: "string" } },
              },
              content: { "application/json": { schema: schema(projectsResponseSchema) } },
            },
            "304": {
              description: "Not modified; the If-None-Match value matched the current ETag.",
            },
          },
        },
      },
      "/api/v1/projects/{slug}": {
        get: {
          tags: ["projects"],
          summary: "Get one case study",
          operationId: "getProject",
          parameters: [slugParameter],
          responses: {
            "200": {
              description: "The case study.",
              content: { "application/json": { schema: schema(publicProjectSchema) } },
            },
            "304": { description: "Not modified." },
            "404": {
              description: "No published case study has that slug.",
              content: { "application/json": { schema: schema(errorSchema) } },
            },
          },
        },
      },
      "/api/v1/views/{kind}/{slug}": {
        get: {
          tags: ["views"],
          summary: "Read a view count",
          operationId: "getViews",
          parameters: [
            kindParameter,
            { ...slugParameter, description: "Slug of the case study or post." },
          ],
          responses: {
            "200": {
              description: "The count, or null when counting is disabled.",
              content: { "application/json": { schema: schema(viewsSchema) } },
            },
            "404": {
              description: "Unknown content key.",
              content: { "application/json": { schema: schema(errorSchema) } },
            },
          },
        },
        post: {
          tags: ["views"],
          summary: "Increment a view count",
          operationId: "incrementViews",
          description: "Same-origin only: cross-site requests receive 403.",
          parameters: [
            kindParameter,
            { ...slugParameter, description: "Slug of the case study or post." },
          ],
          responses: {
            "200": {
              description: "The new count, or null when counting is disabled.",
              content: { "application/json": { schema: schema(viewsSchema) } },
              "403": {
                description: "Cross-site request.",
                content: { "application/json": { schema: schema(errorSchema) } },
              },
            },
            "404": {
              description: "Unknown content key.",
              content: { "application/json": { schema: schema(errorSchema) } },
            },
            "429": {
              description: "Rate limit exceeded for this client.",
              content: { "application/json": { schema: schema(errorSchema) } },
            },
          },
        },
      },
      "/api/v1/github": {
        get: {
          tags: ["activity"],
          summary: "Recently pushed public repositories",
          operationId: "getGithubActivity",
          description:
            "Fetched from the GitHub REST API and cached for an hour. Degrades to source=unavailable instead of failing.",
          responses: {
            "200": {
              description: "Recent repositories.",
              content: { "application/json": { schema: schema(githubSchema) } },
            },
          },
        },
      },
      "/api/health": {
        get: {
          tags: ["ops"],
          summary: "Health check",
          operationId: "getHealth",
          responses: {
            "200": {
              description: "Service healthy.",
              content: { "application/json": { schema: schema(healthSchema) } },
            },
            "503": {
              description: "A dependency check failed.",
              content: { "application/json": { schema: schema(healthSchema) } },
            },
          },
        },
      },
      "/api/v1/openapi.json": {
        get: {
          tags: ["ops"],
          summary: "This document",
          operationId: "getOpenApi",
          responses: {
            "200": {
              description: "The OpenAPI 3.1 document.",
              content: { "application/json": { schema: { type: "object" } } },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Project: schema(publicProjectSchema),
        ProjectsResponse: schema(projectsResponseSchema),
        Views: schema(viewsSchema),
        Health: schema(healthSchema),
        GithubActivity: schema(githubSchema),
        Error: schema(errorSchema),
      },
    },
  } as const;
}

export type OpenApiDocument = ReturnType<typeof getOpenApiDocument>;
