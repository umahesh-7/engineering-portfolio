import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  initials,
  name,
  className,
}: {
  initials: string;
  name: string;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5 rounded-md", className)}
      aria-label={`${name}, home`}
    >
      <span
        aria-hidden="true"
        data-initials={initials}
        className="grid size-9 place-items-center rounded-lg bg-primary font-mono font-semibold text-primary-foreground text-sm tracking-tight shadow-xs transition-transform before:content-[attr(data-initials)] group-hover:-rotate-3"
      />
      <span className="sr-only font-semibold text-sm tracking-tight sm:not-sr-only">{name}</span>
      <span className="sr-only">, home</span>
    </Link>
  );
}
