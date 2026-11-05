import { API_VERSION, conditionalJson, listPublicProjects, preflight } from "@/lib/api";

export async function GET(request: Request) {
  const data = listPublicProjects();
  return conditionalJson(request, { data, meta: { count: data.length, version: API_VERSION } });
}

export function OPTIONS() {
  return preflight();
}
