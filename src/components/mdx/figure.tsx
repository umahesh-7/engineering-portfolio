import type * as React from "react";

export function Figure({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <figure className="my-8 overflow-hidden rounded-lg border border-border bg-card p-4">
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
