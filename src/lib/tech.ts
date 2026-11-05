import type { Project, ProjectCardData } from "@/lib/schemas";
import { slugify } from "@/lib/utils";

const ALIASES: Record<string, string> = {
  "node-js": "nodejs",
  "next-js": "nextjs",
  "vue-js": "vuejs",
  "rest-apis": "rest-api",
  net: "dotnet",
  "tailwind-css": "tailwind",
  "c-sharp": "csharp",
};

/** Normalises a stack entry to the tag vocabulary used by the skills matrix and filters. */
export function techTag(name: string): string {
  const slug = slugify(name);
  return ALIASES[slug] ?? slug;
}

export function projectTechTags(project: Pick<Project, "stack">): string[] {
  return [...new Set(project.stack.map(techTag))];
}

export function toProjectCard(project: Project): ProjectCardData {
  return {
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    employer: project.employer,
    period: project.period,
    primaryPillar: project.primaryPillar,
    pillars: project.pillars,
    stack: project.stack,
    tags: project.tags,
    outcomes: project.outcomes.map(({ value, label, hedge }) =>
      hedge ? { value, label, hedge } : { value, label },
    ),
    techTags: projectTechTags(project),
  };
}
