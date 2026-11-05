import { expect, test } from "@playwright/test";

test.describe("public API", () => {
  test("lists projects with cache, CORS and ETag headers and answers conditional requests", async ({
    request,
  }) => {
    const response = await request.get("/api/v1/projects");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(response.headers()["access-control-allow-origin"]).toBe("*");
    expect(response.headers()["cache-control"]).toContain("s-maxage");
    const etag = response.headers().etag ?? "";
    expect(etag).toMatch(/^"/);
    const body = await response.json();
    expect(body.meta.count).toBeGreaterThanOrEqual(6);
    for (const project of body.data) {
      expect(Object.keys(project)).not.toContain("draft");
      expect(Object.keys(project)).not.toContain("gate");
      for (const outcome of project.outcomes) expect(typeof outcome.basis).toBe("string");
    }
    const conditional = await request.get("/api/v1/projects", {
      headers: { "If-None-Match": etag },
    });
    expect(conditional.status()).toBe(304);
  });

  test("returns a single project and a JSON 404 for unknown slugs", async ({ request }) => {
    const ok = await request.get("/api/v1/projects/this-portfolio");
    expect(ok.status()).toBe(200);
    expect((await ok.json()).slug).toBe("this-portfolio");
    const missing = await request.get("/api/v1/projects/does-not-exist");
    expect(missing.status()).toBe(404);
    expect((await missing.json()).error.code).toBe("not_found");
  });

  test("serves an OpenAPI 3.1 document that matches the endpoints", async ({ request }) => {
    const response = await request.get("/api/v1/openapi.json");
    expect(response.status()).toBe(200);
    const doc = await response.json();
    expect(doc.openapi).toBe("3.1.0");
    expect(Object.keys(doc.paths)).toContain("/api/v1/projects/{slug}");
    expect(doc.components.schemas.Project.required).toContain("slug");
  });

  test("health reports status, version and dependency checks", async ({ request }) => {
    const response = await request.get("/api/health");
    expect([200, 503]).toContain(response.status());
    const body = await response.json();
    expect(["ok", "degraded"]).toContain(body.status);
    expect(["ok", "disabled", "error"]).toContain(body.checks.redis);
    expect(response.headers()["cache-control"]).toBe("no-store");
  });

  test("view counts validate the content key", async ({ request }) => {
    const known = await request.get("/api/v1/views/projects%2Fthis-portfolio");
    expect(known.status()).toBe(200);
    expect(await known.json()).toMatchObject({ slug: "projects/this-portfolio" });
    const unknown = await request.post("/api/v1/views/projects%2Fnope");
    expect(unknown.status()).toBe(404);
  });

  test("pages carry the security headers", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["strict-transport-security"]).toContain("max-age=63072000");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});
