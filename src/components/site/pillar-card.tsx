import { ArrowRightIcon, LayersIcon, MonitorSmartphoneIcon, ServerCogIcon } from "lucide-react";
import Link from "next/link";
import { openProofPoints, openText } from "@/lib/content";
import { PILLAR_LABELS } from "@/lib/pillars";
import type { PillarCard as PillarCardData } from "@/lib/schemas";

const ICONS = {
  ui: MonitorSmartphoneIcon,
  backend: ServerCogIcon,
  fullstack: LayersIcon,
  platform: ServerCogIcon,
} as const;

export function PillarCard({ card, limit = 4 }: { card: PillarCardData; limit?: number }) {
  const Icon = ICONS[card.pillar];
  const points = openProofPoints(card.proofPoints).slice(0, limit);
  const blurb = openText(card.blurb);
  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <p className="font-medium font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
          {PILLAR_LABELS[card.pillar]}
        </p>
      </div>
      <h3 className="mt-4 text-balance font-semibold text-title tracking-tight">{card.title}</h3>
      <p className="mt-3 text-pretty text-muted-foreground text-sm">{blurb}</p>
      <ul className="mt-5 space-y-3 border-border border-t pt-5 text-sm">
        {points.map((point) => (
          <li key={point.text} className="flex gap-2.5">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            {point.project ? (
              <Link
                href={`/projects/${point.project}`}
                className="text-pretty underline-offset-4 hover:underline"
              >
                {point.text}
              </Link>
            ) : (
              <span className="text-pretty">{point.text}</span>
            )}
          </li>
        ))}
      </ul>
      <Link
        href={`/projects?pillar=${card.pillar}`}
        className="mt-auto inline-flex items-center gap-1 pt-5 font-medium text-primary text-sm hover:underline"
      >
        {PILLAR_LABELS[card.pillar]} case studies
        <ArrowRightIcon className="size-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
