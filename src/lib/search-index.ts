import "server-only";

import { getPosts, getProjects } from "@/lib/content";
import { PILLAR_LABELS } from "@/lib/pillars";

export interface SearchItem {
  group: "Pages" | "Case studies" | "Writing";
  label: string;
  href: string;
  hint?: string;
  keywords?: string;
}

const PAGES: SearchItem[] = [
  { group: "Pages", label: "Home", href: "/", keywords: "start hero" },
  { group: "Pages", label: "Case studies", href: "/projects", keywords: "projects work portfolio" },
  {
    group: "Pages",
    label: "About",
    href: "/about",
    keywords: "experience timeline skills education certifications",
  },
  { group: "Pages", label: "Writing", href: "/writing", keywords: "blog posts articles" },
  { group: "Pages", label: "Résumé", href: "/resume", keywords: "cv print download" },
  { group: "Pages", label: "Contact", href: "/contact", keywords: "email message hire" },
  { group: "Pages", label: "API docs", href: "/api/docs", keywords: "openapi json rest" },
];

/** Built at render time from the content loaders; small enough to ship to the palette as props. */
export function getSearchIndex(): SearchItem[] {
  const projects = getProjects().map<SearchItem>((project) => ({
    group: "Case studies",
    label: project.title,
    href: `/projects/${project.slug}`,
    hint: PILLAR_LABELS[project.primaryPillar],
    keywords: [project.employer, ...project.stack, ...project.tags].join(" "),
  }));
  const posts = getPosts().map<SearchItem>((post) => ({
    group: "Writing",
    label: post.title,
    href: `/writing/${post.slug}`,
    hint: post.publishedAt,
    keywords: post.tags.join(" "),
  }));
  return [...PAGES, ...projects, ...posts];
}
