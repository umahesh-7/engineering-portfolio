import { json, preflight } from "@/lib/api";
import { getOpenApiDocument } from "@/lib/openapi";

export function GET() {
  return json(getOpenApiDocument(), {
    cache: "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  });
}

export function OPTIONS() {
  return preflight();
}
