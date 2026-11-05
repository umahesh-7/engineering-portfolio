import { ImageResponse } from "next/og";
import { MonogramIcon } from "@/lib/og";

const CACHE = { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" };

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<MonogramIcon size={32} />, { ...size, headers: CACHE });
}
