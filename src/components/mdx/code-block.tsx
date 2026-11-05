"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { type ComponentProps, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function CodeBlock({ className, children, ...props }: ComponentProps<"pre">) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = ref.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="group relative">
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: a horizontally scrollable code region must be reachable by keyboard (axe: scrollable-region-focusable). */}
      <pre ref={ref} className={cn("pr-12", className)} tabIndex={0} {...props}>
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-md border border-border bg-background/80 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? <CheckIcon className="size-4 text-success" /> : <CopyIcon className="size-4" />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Code copied to clipboard" : ""}
      </span>
    </div>
  );
}
