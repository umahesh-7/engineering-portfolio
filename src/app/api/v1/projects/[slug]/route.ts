import { apiError, conditionalJson, listPublicProjects, preflight } from "@/lib/api";

export async function GET(request: Request, context: RouteContext<"/api/v1/projects/[slug]">) {
  const { slug } = await context.params;
  const project = listPublicProjects().find((item) => item.slug === slug);
  if (!project)
    return apiError(404, "not_found", `No published case study has the slug "${slug}".`);
  return conditionalJson(request, project);
}

export function OPTIONS() {
  return preflight();
}
