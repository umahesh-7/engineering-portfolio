import { ImageResponse } from "next/og";
import { MonogramIcon } from "@/lib/og";

const CACHE = { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" };

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<MonogramIcon size={180} />, { ...size, headers: CACHE });
}
