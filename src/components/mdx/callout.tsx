import { InfoIcon, LightbulbIcon, TriangleAlertIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

const STYLES = {
  note: { icon: InfoIcon, className: "border-primary/30 bg-accent/50" },
  tip: { icon: LightbulbIcon, className: "border-success/40 bg-success/10" },
  warning: { icon: TriangleAlertIcon, className: "border-destructive/40 bg-destructive/10" },
} as const;

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: keyof typeof STYLES;
  title?: string;
  children: React.ReactNode;
}) {
  const { icon: Icon, className } = STYLES[type];
  return (
    <aside className={cn("my-6 flex gap-3 rounded-lg border p-4 text-sm", className)} role="note">
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="[&>p]:m-0 [&>p+p]:mt-2">
        {title ? <p className="mb-1 font-semibold">{title}</p> : null}
        {children}
      </div>
    </aside>
  );
}

/** Marks a statement that is inferred from an outcome rather than stated in the source documents. */
export function Inferred({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-sm bg-muted px-1 py-0.5 text-muted-foreground"
      title="Inferred from the stated outcome; not described in the source documents"
    >
      <span className="font-mono text-[0.7em] uppercase tracking-wider">Inferred</span> {children}
    </span>
  );
}
