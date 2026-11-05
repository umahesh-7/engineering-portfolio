import { describe, expect, it } from "vitest";
import { conditionalJson, etagFor, listPublicProjects, toPublicProject } from "@/lib/api";
import { getProjects } from "@/lib/content";
import { getOpenApiDocument } from "@/lib/openapi";
import { PUBLIC_PROJECT_KEYS } from "@/lib/schemas";
import { toProjectCard } from "@/lib/tech";

describe("public API serializer", () => {
  it("emits only allowlisted keys", () => {
    for (const project of listPublicProjects()) {
      for (const key of Object.keys(project)) expect(PUBLIC_PROJECT_KEYS).toContain(key);
      expect(project).not.toHaveProperty("draft");
      expect(project).not.toHaveProperty("gate");
      expect(project).not.toHaveProperty("body");
    }
  });

  it("renders metric bases as text", () => {
    const project = getProjects().find((p) => p.outcomes.length > 0);
    expect(project).toBeDefined();
    const output = toPublicProject(project as NonNullable<typeof project>);
    expect(typeof output.outcomes[0]?.basis).toBe("string");
    expect(output.outcomes[0]?.basis).toMatch(/^(Measured|As stated)/);
  });
});

describe("card data for client components", () => {
  it("carries no build-time controls or metric bases", () => {
    for (const project of getProjects()) {
      const card = toProjectCard(project) as unknown as Record<string, unknown>;
      for (const key of [
        "draft",
        "gate",
        "featured",
        "featuredRank",
        "order",
        "body",
        "readingMinutes",
      ]) {
        expect(card).not.toHaveProperty(key);
      }
      for (const outcome of toProjectCard(project).outcomes)
        expect(outcome).not.toHaveProperty("basis");
    }
  });
});

describe("conditional responses", () => {
  it("answers a matching If-None-Match with 304 and no body", async () => {
    const body = { hello: "world" };
    const etag = etagFor(JSON.stringify(body));
    expect(etagFor(JSON.stringify(body))).toBe(etag);
    const fresh = conditionalJson(new Request("http://localhost/x"), body);
    expect(fresh.status).toBe(200);
    expect(fresh.headers.get("etag")).toBe(etag);
    expect(fresh.headers.get("access-control-allow-origin")).toBe("*");
    expect(fresh.headers.get("cache-control")).toContain("s-maxage");
    const conditional = conditionalJson(
      new Request("http://localhost/x", { headers: { "if-none-match": etag } }),
      body,
    );
    expect(conditional.status).toBe(304);
    expect(await conditional.text()).toBe("");
  });
});

describe("OpenAPI document", () => {
  it("describes every endpoint and component", () => {
    const doc = getOpenApiDocument();
    expect(doc.openapi).toBe("3.1.0");
    expect(Object.keys(doc.paths)).toEqual(
      expect.arrayContaining([
        "/api/v1/projects",
        "/api/v1/projects/{slug}",
        "/api/v1/views/{kind}/{slug}",
        "/api/health",
      ]),
    );
    const project = doc.components.schemas.Project as {
      required?: string[];
      properties?: Record<string, unknown>;
    };
    expect(project.required).toEqual(expect.arrayContaining(["slug", "title", "url"]));
    expect(Object.keys(project.properties ?? {}).sort()).toEqual([...PUBLIC_PROJECT_KEYS].sort());
  });
});
