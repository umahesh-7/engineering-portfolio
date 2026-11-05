import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectExplorer } from "@/components/site/project-explorer";
import { Section } from "@/components/site/section";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjects, getTechFacets } from "@/lib/content";
import { toProjectSummary } from "@/lib/tech";

export const metadata: Metadata = {
  title: "Case studies",
  description:
    "Case studies across UI engineering, backend development and full-stack delivery, filterable by pillar, technology and theme.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  const projects = getProjects().map(toProjectSummary);
  const facets = getTechFacets();
  return (
    <Section
      id="projects"
      eyebrow="Case studies"
      title="Work I can stand behind"
      description="Every study follows the same template: context, constraints, what I built, what changed with the basis for each figure, and the stack. Filters are reflected in the URL so a view can be shared."
    >
      <Suspense fallback={<ExplorerSkeleton />}>
        <ProjectExplorer projects={projects} facets={facets} />
      </Suspense>
    </Section>
  );
}

function ExplorerSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
