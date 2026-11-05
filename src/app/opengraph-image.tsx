import { ImageResponse } from "next/og";
import { site } from "@/lib/content";
import { env } from "@/lib/env";
import { OG_SIZE, OgCard } from "@/lib/og";

export const alt = `${site.name}, ${site.role}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow={site.titleLine}
      title={site.headline.fallback}
      description={site.seo.description}
      footer={new URL(env.NEXT_PUBLIC_SITE_URL).host}
    />,
    size,
  );
}
