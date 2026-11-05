import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PILLAR_LABELS } from "@/lib/pillars";
import type { ProjectCardData } from "@/lib/schemas";
import { cn, formatPeriod } from "@/lib/utils";

export function ProjectCard({
  project,
  className,
}: {
  project: ProjectCardData;
  className?: string;
}) {
  const outcomes = project.outcomes.slice(0, 2);
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-pop motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {project.pillars.map((pillar) => (
          <Badge key={pillar} variant={pillar === project.primaryPillar ? "secondary" : "outline"}>
            {PILLAR_LABELS[pillar]}
          </Badge>
        ))}
      </div>
      <h3 className="mt-4 font-semibold text-title tracking-tight">
        <Link
          href={`/projects/${project.slug}`}
          className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
        >
          {project.title}
        </Link>
      </h3>
      <p className="mt-1 text-muted-foreground text-xs">
        {project.employer} · {formatPeriod(project.period)}
      </p>
      <p className="mt-3 text-pretty text-muted-foreground text-sm">{project.summary}</p>
      {outcomes.length > 0 ? (
        <dl className="mt-4 grid grid-cols-2 gap-3">
          {outcomes.map((metric) => (
            <div key={`${metric.value}-${metric.label}`} className="rounded-md bg-muted/60 p-3">
              <dt className="text-muted-foreground text-xs">{metric.label}</dt>
              <dd className="font-mono font-semibold text-lg">
                {metric.hedge ? (
                  <span className="mr-1 font-normal text-muted-foreground text-xs">
                    {metric.hedge}
                  </span>
                ) : null}
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Stack">
        {project.stack.slice(0, 5).map((item) => (
          <li
            key={item}
            className="rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
      <span
        className="mt-auto inline-flex items-center gap-1 pt-5 font-medium text-primary text-sm"
        aria-hidden="true"
      >
        Read the case study
        <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </article>
  );
}
