import { apiError, json, preflight } from "@/lib/api";
import { getPosts, getProjects } from "@/lib/content";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { getRedis } from "@/lib/redis";
import { getViews, incrementViews } from "@/lib/views";

const readLimiter = createRateLimiter(getRedis(), {
  prefix: "views-read",
  limit: 120,
  windowMs: 60 * 1000,
});
const writeLimiter = createRateLimiter(getRedis(), {
  prefix: "views-write",
  limit: 30,
  windowMs: 60 * 1000,
});

/** Content keys look like `projects/<slug>` or `posts/<slug>`; only published content can be counted. */
function isKnown(key: string): boolean {
  const [kind, ...rest] = key.split("/");
  const slug = rest.join("/");
  if (!slug) return false;
  if (kind === "projects") return getProjects().some((project) => project.slug === slug);
  if (kind === "posts") return getPosts().some((post) => post.slug === slug);
  return false;
}

async function keyFrom(context: RouteContext<"/api/v1/views/[...slug]">): Promise<string> {
  const { slug } = await context.params;
  return slug.join("/");
}

export async function GET(request: Request, context: RouteContext<"/api/v1/views/[...slug]">) {
  const key = await keyFrom(context);
  if (!isKnown(key)) return apiError(404, "not_found", "Unknown content key.");
  const rate = await readLimiter.limit(clientKey(request.headers));
  if (!rate.success) return apiError(429, "rate_limited", "Too many requests. Try again shortly.");
  const views = await getViews(key);
  return json({ slug: key, views }, { cache: "no-store" });
}

export async function POST(request: Request, context: RouteContext<"/api/v1/views/[...slug]">) {
  const key = await keyFrom(context);
  if (!isKnown(key)) return apiError(404, "not_found", "Unknown content key.");
  // Increments are same-origin only: other sites must not be able to inflate counts from visitors' browsers.
  const fetchSite = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");
  const sameOrigin = fetchSite
    ? fetchSite !== "cross-site"
    : !origin || new URL(origin).host === new URL(request.url).host;
  if (!sameOrigin) return apiError(403, "forbidden", "Cross-site increments are not accepted.");
  const rate = await writeLimiter.limit(`${clientKey(request.headers)}:${key}`);
  if (!rate.success) return apiError(429, "rate_limited", "Too many requests. Try again shortly.");
  const views = await incrementViews(key);
  return json({ slug: key, views }, { cache: "no-store", cors: false });
}

export function OPTIONS() {
  return preflight("GET, HEAD, OPTIONS");
}
