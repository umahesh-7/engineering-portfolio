import type { TocEntry } from "@/lib/mdx";
import { cn } from "@/lib/utils";

export function Toc({ entries }: { entries: TocEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <nav aria-label="On this page">
      <p className="font-medium font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
        On this page
      </p>
      <ol className="mt-3 space-y-1.5 border-border border-l text-sm">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={cn(
                "-ml-px block border-transparent border-l py-0.5 text-muted-foreground transition-colors hover:border-primary hover:text-foreground",
                entry.depth === 2 ? "pl-4" : "pl-7 text-xs",
              )}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
