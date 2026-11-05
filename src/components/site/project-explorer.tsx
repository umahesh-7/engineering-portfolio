"use client";

import { XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProjectCard } from "@/components/site/project-card";
import { Button } from "@/components/ui/button";
import { isPillar, PILLAR_LABELS, PILLARS, type Pillar } from "@/lib/pillars";
import type { ProjectCardData } from "@/lib/schemas";
import { cn } from "@/lib/utils";

interface Facet {
  tag: string;
  name: string;
}

interface Filters {
  pillar: Pillar | null;
  tech: string[];
  tag: string | null;
}

const NO_FILTERS: Filters = { pillar: null, tech: [], tag: null };

const TAG_LABELS: Record<string, string> = {
  "manual-to-automated": "Manual to automated",
  healthcare: "Healthcare",
  performance: "Performance",
  testing: "Testing",
  security: "Security",
  platform: "Platform",
  integration: "Integration",
  "open-source": "Open source",
  accessibility: "Accessibility",
};

function parseFilters(params: URLSearchParams): Filters {
  const pillarParam = params.get("pillar");
  return {
    pillar: isPillar(pillarParam) ? pillarParam : null,
    tech: (params.get("tech") ?? "").split(",").filter(Boolean),
    tag: params.get("tag"),
  };
}

function toQuery(filters: Filters): string {
  const search = new URLSearchParams();
  if (filters.pillar) search.set("pillar", filters.pillar);
  if (filters.tech.length) search.set("tech", filters.tech.join(","));
  if (filters.tag) search.set("tag", filters.tag);
  return search.toString();
}

/**
 * Reads the URL inside its own Suspense boundary so the grid itself is part of the static shell:
 * the prerendered HTML carries every card, and the URL's filters apply once the page hydrates.
 */
function SearchParamsSync({ onChange }: { onChange: (filters: Filters) => void }) {
  const params = useSearchParams();
  useEffect(() => {
    onChange(parseFilters(new URLSearchParams(params.toString())));
  }, [params, onChange]);
  return null;
}

export function ProjectExplorer({
  projects,
  facets,
}: {
  projects: ProjectCardData[];
  facets: Facet[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const { pillar, tech, tag } = filters;

  const availableTech = useMemo(() => {
    const used = new Set(projects.flatMap((project) => project.techTags));
    return facets.filter((facet) => used.has(facet.tag));
  }, [projects, facets]);

  const availableTags = useMemo(
    () => [...new Set(projects.flatMap((project) => project.tags))].sort(),
    [projects],
  );

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

  const apply = useCallback(
    (next: Filters) => {
      setFilters(next);
      const query = toQuery(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const hasFilters = Boolean(pillar || tech.length || tag);

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <Suspense fallback={null}>
        <SearchParamsSync onChange={setFilters} />
      </Suspense>
      <aside aria-label="Filters" className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <FilterGroup label="Pillar">
          {PILLARS.map((value) => (
            <Chip
              key={value}
              pressed={pillar === value}
              onClick={() => apply({ ...filters, pillar: pillar === value ? null : value })}
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
                  apply({
                    ...filters,
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
              onClick={() => apply({ ...filters, tag: tag === value ? null : value })}
            >
              {TAG_LABELS[value] ?? value}
            </Chip>
          ))}
        </FilterGroup>
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              apply(NO_FILTERS);
              statusRef.current?.focus();
            }}
          >
            <XIcon aria-hidden="true" />
            Clear filters
          </Button>
        ) : null}
      </aside>

      <div>
        <p
          ref={statusRef}
          tabIndex={-1}
          className="mb-4 text-muted-foreground text-sm outline-none"
          role="status"
          aria-live="polite"
        >
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
        "inline-flex min-h-11 items-center rounded-full border px-3 py-1 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring md:min-h-8",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
