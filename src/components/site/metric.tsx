import type { Metric, MetricBasis } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const SOURCE_LABEL = {
  resume: "the résumé",
  linkedin: "LinkedIn",
  both: "the résumé and LinkedIn",
} as const;

/** One line that says where a figure comes from. A metric cannot exist without it (see metricSchema). */
export function basisText(basis: MetricBasis): string {
  if (basis.kind === "measured") {
    const parts = [`Measured: ${basis.what}`];
    if (basis.tool) parts.push(`with ${basis.tool}`);
    if (basis.window) parts.push(basis.window);
    return parts.join(", ");
  }
  const note = basis.note ? `; ${basis.note}` : "";
  return `As stated on ${SOURCE_LABEL[basis.source]}${note}`;
}

export function MetricStat({ metric, className }: { metric: Metric; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <p className="font-mono font-semibold text-2xl tracking-tight">
        {metric.hedge ? (
          <span className="mr-1 font-normal text-muted-foreground text-sm">{metric.hedge}</span>
        ) : null}
        {metric.value}
      </p>
      <p className="mt-1 text-sm">{metric.label}</p>
      <p className="mt-2 text-muted-foreground text-xs">{basisText(metric.basis)}</p>
    </div>
  );
}

export function MetricList({ metrics, className }: { metrics: Metric[]; className?: string }) {
  if (metrics.length === 0) return null;
  return (
    <div className={cn("not-prose my-6 grid gap-3 sm:grid-cols-2", className)}>
      {metrics.map((metric) => (
        <MetricStat key={`${metric.value}-${metric.label}`} metric={metric} />
      ))}
    </div>
  );
}
