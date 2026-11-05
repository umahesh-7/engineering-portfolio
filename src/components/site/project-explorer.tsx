"use client";

import { XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { ProjectCard } from "@/components/site/project-card";
import { Button } from "@/components/ui/button";
import { isPillar, PILLAR_LABELS, PILLARS, type Pillar } from "@/lib/pillars";
import type { ProjectSummary } from "@/lib/schemas";
import { cn } from "@/lib/utils";

interface Facet {
  tag: string;
  name: string;
}

const TAG_LABELS: Record<string, string> = {
  "manual-to-automated": "Manual to automated",
  healthcare: "Healthcare",
  performance: "Performance",
  testing: "Testing",
  security: "Security",
  platform: "Platform",
  integration: "Integration",
  backend: "Backend",
  "open-source": "Open source",
  accessibility: "Accessibility",
};

function parseList(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

export function ProjectExplorer({
  projects,
  facets,
}: {
  projects: ProjectSummary[];
  facets: Facet[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const pillarParam = params.get("pillar");
  const pillar: Pillar | null = isPillar(pillarParam) ? pillarParam : null;
  const tech = parseList(params.get("tech"));
  const tag = params.get("tag");

  const availableTech = useMemo(() => {
    const used = new Set(projects.flatMap((project) => project.techTags));
    return facets.filter((facet) => used.has(facet.tag));
  }, [projects, facets]);

  const availableTags = useMemo(() => {
    const used = new Set(projects.flatMap((project) => project.tags));
    return [...used].sort();
  }, [projects]);

  const filtered = useMemo(
    () =>
      projects.filter(
        (project) =>
          (!pillar || project.pillars.includes(pillar)) &&
          tech.every((t) => project.techTags.includes(t)) &&
          (!tag || project.tags.includes(tag)),
      ),
    [projects, pillar, tech, tag],
  );

  const update = useCallback(
    (next: { pillar?: string | null; tech?: string[]; tag?: string | null }) => {
      const search = new URLSearchParams(params.toString());
      const setOrDelete = (key: string, value: string | null | undefined) => {
        if (value) search.set(key, value);
        else search.delete(key);
      };
      if ("pillar" in next) setOrDelete("pillar", next.pillar ?? null);
      if ("tech" in next) setOrDelete("tech", next.tech?.length ? next.tech.join(",") : null);
      if ("tag" in next) setOrDelete("tag", next.tag ?? null);
      const query = search.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const hasFilters = Boolean(pillar || tech.length || tag);

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <aside aria-label="Filters" className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <FilterGroup label="Pillar">
          {PILLARS.map((value) => (
            <Chip
              key={value}
              pressed={pillar === value}
              onClick={() => update({ pillar: pillar === value ? null : value })}
            >
              {PILLAR_LABELS[value]}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Technology">
          {availableTech.map((facet) => {
            const pressed = tech.includes(facet.tag);
            return (
              <Chip
                key={facet.tag}
                pressed={pressed}
                onClick={() =>
                  update({
                    tech: pressed ? tech.filter((t) => t !== facet.tag) : [...tech, facet.tag],
                  })
                }
              >
                {facet.name}
              </Chip>
            );
          })}
        </FilterGroup>
        <FilterGroup label="Theme">
          {availableTags.map((value) => (
            <Chip
              key={value}
              pressed={tag === value}
              onClick={() => update({ tag: tag === value ? null : value })}
            >
              {TAG_LABELS[value] ?? value}
            </Chip>
          ))}
        </FilterGroup>
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => update({ pillar: null, tech: [], tag: null })}
          >
            <XIcon aria-hidden="true" />
            Clear filters
          </Button>
        ) : null}
      </aside>

      <div>
        <p className="mb-4 text-muted-foreground text-sm" role="status" aria-live="polite">
          Showing {filtered.length} of {projects.length} case studies
          {hasFilters ? " matching the selected filters" : ""}.
        </p>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border border-dashed p-10 text-center text-muted-foreground">
            No case study matches every selected filter. Clear one to widen the results.
          </div>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {filtered.map((project) => (
              <li key={project.slug} className="h-full">
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 font-medium font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
