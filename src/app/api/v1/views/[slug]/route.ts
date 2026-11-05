import { apiError, json } from "@/lib/api";
import { getPosts, getProjects } from "@/lib/content";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { getRedis } from "@/lib/redis";
import { getViews, incrementViews } from "@/lib/views";

const limiter = createRateLimiter(getRedis(), { prefix: "views", limit: 30, windowMs: 60 * 1000 });

function isKnown(slug: string): boolean {
  const [kind, ...rest] = slug.split("/");
  const key = rest.join("/");
  if (!key) return false;
  if (kind === "projects") return getProjects().some((project) => project.slug === key);
  if (kind === "posts") return getPosts().some((post) => post.slug === key);
  return false;
}

export async function GET(_request: Request, context: RouteContext<"/api/v1/views/[slug]">) {
  const slug = decodeURIComponent((await context.params).slug);
  if (!isKnown(slug)) return apiError(404, "not_found", "Unknown content key.");
  const views = await getViews(slug);
  return json({ slug, views }, { cache: "no-store" });
}

export async function POST(request: Request, context: RouteContext<"/api/v1/views/[slug]">) {
  const slug = decodeURIComponent((await context.params).slug);
  if (!isKnown(slug)) return apiError(404, "not_found", "Unknown content key.");
  const rate = await limiter.limit(`${clientKey(request.headers)}:${slug}`);
  if (!rate.success) return apiError(429, "rate_limited", "Too many requests. Try again shortly.");
  const views = await incrementViews(slug);
  return json({ slug, views }, { cache: "no-store" });
}
