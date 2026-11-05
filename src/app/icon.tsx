import { ImageResponse } from "next/og";
import { MonogramIcon } from "@/lib/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<MonogramIcon size={32} />, size);
}
