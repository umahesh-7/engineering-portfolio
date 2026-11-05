import { expect, test } from "@playwright/test";

test("home page has canonical, description, Open Graph image and JSON-LD on the about page", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Mahesh Utlapalli/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /full-stack/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /^https?:\/\/[^/]+\/?$/,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  await page.goto("/about");
  const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(JSON.parse(jsonLd ?? "{}")["@type"]).toBe("Person");
});

test("sitemap lists every case study and post", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const projects = await (await request.get("/api/v1/projects")).json();
  for (const project of projects.data) expect(sitemap).toContain(`/projects/${project.slug}`);
  expect(sitemap).toContain("/writing/building-this-portfolio");
});

test("robots, manifest and RSS feed are served", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap:");
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  const feed = await request.get("/feed.xml");
  expect(feed.headers()["content-type"]).toContain("application/rss+xml");
  expect(await feed.text()).toContain("<rss");
});
