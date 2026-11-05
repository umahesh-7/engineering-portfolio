import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.NEXT_PUBLIC_SITE_URL;
  return {
    rules: [{ userAgent: "*", allow: ["/", "/api/docs"], disallow: ["/api/v1/", "/api/health"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
