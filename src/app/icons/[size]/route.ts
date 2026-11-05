import { ImageResponse } from "next/og";
import { createElement } from "react";
import { MonogramIcon } from "@/lib/og";

const SIZES = new Set(["192", "512"]);

export function generateStaticParams() {
  return [...SIZES].map((size) => ({ size }));
}

export async function GET(_request: Request, context: RouteContext<"/icons/[size]">) {
  const { size } = await context.params;
  if (!SIZES.has(size)) return new Response("Not found", { status: 404 });
  const pixels = Number(size);
  return new ImageResponse(createElement(MonogramIcon, { size: pixels }), {
    width: pixels,
    height: pixels,
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
