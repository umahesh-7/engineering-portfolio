import "server-only";

import fs from "node:fs";
import path from "node:path";
import { education, experience } from "@content/experience";
import { site } from "@content/site";
import { skillGroups } from "@content/skills";
import matter from "gray-matter";
import { cache } from "react";
import readingTime from "reading-time";
import {
  type Bullet,
  type Education,
  type Experience,
  type Gate,
  type GatedText,
  type Post,
  type Project,
  type ProofPoint,
  postFrontmatterSchema,
  projectFrontmatterSchema,
  type SkillGroup,
} from "@/lib/schemas";

const CONTENT_DIR = path.join(process.cwd(), "content");
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export { education, experience, site, skillGroups };

/* ------------------------------------------------------------------ */
/* Gates                                                               */
/* ------------------------------------------------------------------ */

export function isGateOpen(gate: Gate | undefined): boolean {
  if (!gate) return true;
  switch (gate) {
    case "omega":
      return site.flags.omegaApproved;
    case "security":
      return site.flags.omegaApproved && site.flags.securityReviewApproved;
    case "albany":
      return site.flags.albanyConfirmed;
  }
}

export function openText(items: GatedText[]): string {
  return items
    .filter((item) => isGateOpen(item.gate))
    .map((item) => item.text)
    .join(" ");
}

export function openProofPoints(points: ProofPoint[]): ProofPoint[] {
  return points.filter((point) => isGateOpen(point.gate));
}

export function openBullets(bullets: Bullet[], view: "about" | "resume" = "about"): Bullet[] {
  return bullets.filter(
    (bullet) => isGateOpen(bullet.gate) && (view === "resume" || !bullet.resumeOnly),
  );
}

/* ------------------------------------------------------------------ */
/* Collections                                                         */
/* ------------------------------------------------------------------ */

function listMdxFiles(dir: string): string[] {
  const absolute = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(absolute)) return [];
  return fs
    .readdirSync(absolute)
    .filter((file) => file.endsWith(".mdx"))
    .sort();
}

function readMdx(dir: string, file: string): { slug: string; data: unknown; body: string } {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, dir, file), "utf8");
  const { data, content } = matter(raw);
  return { slug: file.replace(/\.mdx$/, ""), data, body: content };
}

function minutes(body: string): number {
  return Math.max(1, Math.round(readingTime(body).minutes));
}

/** Projects visible in this build: drafts hidden in production, gated items hidden while their flag is off. */
export const getProjects = cache((): Project[] => {
  return listMdxFiles("projects")
    .map((file) => {
      const { slug, data, body } = readMdx("projects", file);
      const parsed = projectFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(
          `Invalid frontmatter in content/projects/${file}:\n${parsed.error.message}`,
        );
      }
      return { ...parsed.data, slug, body, readingMinutes: minutes(body) } satisfies Project;
    })
    .filter((project) => !(IS_PRODUCTION && project.draft))
    .filter((project) => isGateOpen(project.gate))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
});

export const getProject = cache((slug: string): Project | undefined => {
  return getProjects().find((project) => project.slug === slug);
});

export const getFeaturedProjects = cache((limit = 3): Project[] => {
  return getProjects()
    .filter((project) => project.featured)
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99))
    .slice(0, limit);
});

export const getRelatedProjects = cache((slug: string, limit = 3): Project[] => {
  const current = getProject(slug);
  if (!current) return [];
  return getProjects()
    .filter((project) => project.slug !== slug)
    .map((project) => ({
      project,
      score:
        project.pillars.filter((p) => current.pillars.includes(p)).length * 2 +
        project.stack.filter((s) => current.stack.includes(s)).length +
        project.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.project);
});

export const getPosts = cache((): Post[] => {
  return listMdxFiles("posts")
    .map((file) => {
      const { slug, data, body } = readMdx("posts", file);
      const parsed = postFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(`Invalid frontmatter in content/posts/${file}:\n${parsed.error.message}`);
      }
      return { ...parsed.data, slug, body, readingMinutes: minutes(body) } satisfies Post;
    })
    .filter((post) => !(IS_PRODUCTION && post.draft))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
});

export const getPost = cache((slug: string): Post | undefined => {
  return getPosts().find((post) => post.slug === slug);
});

/** The Writing navigation link appears once two posts are published. */
export const hasWriting = cache(
  (): boolean => getPosts().filter((post) => !post.draft).length >= 2,
);

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

export const getExperience = cache((): Experience[] => experience);
export const getEducation = cache((): Education[] => education);
/** Skill groups with gated entries removed while their flag is off, so names alone never reveal gated work. */
export const getSkillGroups = cache((): SkillGroup[] =>
  skillGroups
    .map((group) => ({ ...group, skills: group.skills.filter((skill) => isGateOpen(skill.gate)) }))
    .filter((group) => group.skills.length > 0),
);

export function findExperience(slug: string): Experience | undefined {
  return experience.find((role) => role.slug === slug);
}

/** Technologies that may be used as /projects filter facets: core and working tiers only. */
export const getTechFacets = cache((): { tag: string; name: string }[] => {
  const seen = new Map<string, string>();
  for (const group of getSkillGroups()) {
    for (const skill of group.skills) {
      if (skill.tag && skill.tier !== "familiar" && !seen.has(skill.tag))
        seen.set(skill.tag, skill.name);
    }
  }
  return [...seen.entries()].map(([tag, name]) => ({ tag, name }));
});
