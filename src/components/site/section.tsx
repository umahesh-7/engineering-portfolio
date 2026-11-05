import type * as React from "react";
import { Container } from "@/components/site/container";
import { cn } from "@/lib/utils";

interface SectionProps extends React.ComponentProps<"section"> {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  action,
  className,
  children,
  ...props
}: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("py-16 sm:py-20 lg:py-24", className)}
      {...props}
    >
      <Container>
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            {eyebrow ? (
              <p className="mb-2 font-medium font-mono text-primary text-xs uppercase tracking-[0.18em]">
                {eyebrow}
              </p>
            ) : null}
            <h2 id={headingId} className="text-balance font-semibold text-headline tracking-tight">
              {title}
            </h2>
            {description ? (
              <p className="mt-3 text-pretty text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
        {children}
      </Container>
    </section>
  );
}
