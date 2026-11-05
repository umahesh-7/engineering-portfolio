import { getPosts, site } from "@/lib/content";
import { env } from "@/lib/env";

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      default:
        return "&quot;";
    }
  });
}

export function GET() {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const posts = getPosts();
  const latest = posts[0]?.publishedAt;
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${base}/writing/${post.slug}</link>
      <guid isPermaLink="true">${base}/writing/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.summary)}</description>
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.name} · Writing`)}</title>
    <link>${base}/writing</link>
    <description>${escapeXml("Notes on building reliable software: testing, APIs, delivery and the decisions behind this site.")}</description>
    <language>en-us</language>
    ${latest ? `<lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>` : ""}
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
