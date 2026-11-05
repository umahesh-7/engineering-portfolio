import "server-only";

import { cacheLife } from "next/cache";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx/mdx-components";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { dark: "github-dark-high-contrast", light: "github-light-high-contrast" },
  keepBackground: true,
  defaultLang: "plaintext",
};

/**
 * Compiles MDX to React elements. Cached with the longest lifetime because the source is part of
 * the build; Shiki loads grammars asynchronously, which would otherwise count as uncached work on
 * routes that must be fully static.
 */
export async function renderMdx(source: string) {
  "use cache";
  cacheLife("max");
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            { behavior: "wrap", properties: { className: ["heading-link"] } },
          ],
          [rehypePrettyCode, prettyCodeOptions],
        ],
      },
    },
  });
  return content;
}

export interface TocEntry {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** Table of contents from markdown headings (## and ###), matching rehype-slug ids. */
export function extractToc(source: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const seen = new Map<string, number>();
  for (const line of source.split("\n")) {
    const match = /^(##|###)\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const depth = match[1] === "##" ? 2 : 3;
    const text = (match[2] ?? "").replace(/[*_`]/g, "");
    let id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    entries.push({ id, text, depth });
  }
  return entries;
}
