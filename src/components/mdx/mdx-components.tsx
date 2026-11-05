import Link from "next/link";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import type * as React from "react";
import { Callout, Inferred } from "@/components/mdx/callout";
import { CodeBlock } from "@/components/mdx/code-block";
import { Figure } from "@/components/mdx/figure";
import { MetricList, MetricStat } from "@/components/site/metric";

function Anchor({ href = "", children, ...props }: React.ComponentProps<"a">) {
  const internal = href.startsWith("/") || href.startsWith("#");
  if (internal) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} rel="noopener noreferrer" target="_blank" {...props}>
      {children}
    </a>
  );
}

export const mdxComponents: NonNullable<MDXRemoteProps["components"]> = {
  a: Anchor,
  pre: CodeBlock,
  Callout,
  Inferred,
  Figure,
  MetricStat,
  MetricList,
};
