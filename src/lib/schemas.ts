import { z } from "zod";
import { PILLARS, type Pillar } from "@/lib/pillars";

/* ------------------------------------------------------------------ */
/* Shared vocab                                                        */
/* ------------------------------------------------------------------ */

export const pillarSchema = z.enum(PILLARS);
export type { Pillar };

/** Content gates: a gated item renders only when the matching flag in content/site.ts is true. */
export const gateSchema = z.enum(["omega", "security", "albany"]);
export type Gate = z.infer<typeof gateSchema>;

export const sourceSchema = z.enum(["resume", "linkedin", "both", "site"]);
export type Source = z.infer<typeof sourceSchema>;

const yearMonth = z.string().regex(/^\d{4}(-\d{2})?$/, "Expected YYYY or YYYY-MM");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const periodSchema = z.object({
  start: yearMonth,
  end: z.union([z.literal("present"), yearMonth]),
});
export type Period = z.infer<typeof periodSchema>;

/* ------------------------------------------------------------------ */
/* Metrics: a figure never renders without its basis                   */
/* ------------------------------------------------------------------ */

export const metricBasisSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("measured"),
    what: z.string().min(1),
    tool: z.string().optional(),
    window: z.string().optional(),
  }),
  z.object({
    kind: z.literal("stated"),
    source: z.enum(["resume", "linkedin", "both"]),
    note: z.string().optional(),
  }),
]);
export type MetricBasis = z.infer<typeof metricBasisSchema>;

export const metricSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  hedge: z.string().optional(),
  basis: metricBasisSchema,
});
export type Metric = z.infer<typeof metricSchema>;

/* ------------------------------------------------------------------ */
/* Projects (case studies)                                             */
/* ------------------------------------------------------------------ */

export const projectFrontmatterSchema = z.object({
  title: z.string().min(3).max(120),
  summary: z.string().min(20).max(260),
  employer: z.string().min(1),
  period: periodSchema,
  primaryPillar: pillarSchema,
  pillars: z.array(pillarSchema).min(1),
  stack: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)).default([]),
  outcomes: z.array(metricSchema).default([]),
  featured: z.boolean().default(false),
  featuredRank: z.number().int().positive().optional(),
  order: z.number().int().default(100),
  draft: z.boolean().default(false),
  gate: gateSchema.optional(),
  publishedAt: isoDate,
  updatedAt: isoDate.optional(),
  sourceLink: z.url().optional(),
});
export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

export interface Project extends ProjectFrontmatter {
  slug: string;
  body: string;
  readingMinutes: number;
}

/** Exactly what a card or filter needs. Build-time controls and the body never reach client components. */
export interface ProjectCardData {
  slug: string;
  title: string;
  summary: string;
  employer: string;
  period: Period;
  primaryPillar: Pillar;
  pillars: Pillar[];
  stack: string[];
  tags: string[];
  outcomes: { value: string; label: string; hedge?: string }[];
  techTags: string[];
}

/* ------------------------------------------------------------------ */
/* Published shape = the allowlist for MDX output and the public API   */
/* ------------------------------------------------------------------ */

export const publicMetricSchema = z.object({
  value: z.string(),
  label: z.string(),
  hedge: z.string().optional(),
  basis: z.string(),
});

export const publicProjectSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  employer: z.string(),
  period: periodSchema,
  primaryPillar: pillarSchema,
  pillars: z.array(pillarSchema),
  stack: z.array(z.string()),
  tags: z.array(z.string()),
  outcomes: z.array(publicMetricSchema),
  url: z.url(),
  publishedAt: isoDate,
  updatedAt: isoDate.optional(),
});
export type PublicProject = z.infer<typeof publicProjectSchema>;

/** Keys that may ever appear in the public JSON API. Checked by tests and the leak script. */
export const PUBLIC_PROJECT_KEYS = Object.keys(
  publicProjectSchema.shape,
) as (keyof PublicProject)[];

/* ------------------------------------------------------------------ */
/* Posts                                                               */
/* ------------------------------------------------------------------ */

export const postFrontmatterSchema = z.object({
  title: z.string().min(3).max(140),
  summary: z.string().min(20).max(300),
  publishedAt: isoDate,
  updatedAt: isoDate.optional(),
  tags: z.array(z.string().min(1)).default([]),
  draft: z.boolean().default(false),
});
export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export interface Post extends PostFrontmatter {
  slug: string;
  body: string;
  readingMinutes: number;
}

/* ------------------------------------------------------------------ */
/* Experience timeline: one data file with per-bullet source flags     */
/* ------------------------------------------------------------------ */

export const bulletSchema = z.object({
  text: z.string().min(1),
  source: sourceSchema,
  gate: gateSchema.optional(),
  /** Shown on /resume only (for example, support-work bullets). */
  resumeOnly: z.boolean().default(false),
});
export type Bullet = z.infer<typeof bulletSchema>;

export const experienceSchema = z.object({
  slug: z.string().min(1),
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  period: periodSchema,
  /** Shown while the role's detailed bullets are gated; also the compact timeline line. */
  summary: z.string().min(1),
  bullets: z.array(bulletSchema),
  stack: z.array(z.string().min(1)).default([]),
  /** Displayed start when the documents conflict on the month (see plan question 1). */
  displayStart: z.string().optional(),
  note: z.string().optional(),
});
export type Experience = z.infer<typeof experienceSchema>;

export const educationSchema = z.object({
  slug: z.string().min(1),
  school: z.string().min(1),
  degree: z.string().min(1),
  period: periodSchema,
  location: z.string().optional(),
});
export type Education = z.infer<typeof educationSchema>;

/* ------------------------------------------------------------------ */
/* Skills                                                              */
/* ------------------------------------------------------------------ */

export const skillTierSchema = z.enum(["core", "working", "familiar"]);
export type SkillTier = z.infer<typeof skillTierSchema>;

export const skillSchema = z.object({
  name: z.string().min(1),
  tier: skillTierSchema,
  /** Skills whose name alone reveals gated current-employer work render only when the gate is open. */
  gate: gateSchema.optional(),
  /** Experience slugs that evidence the skill (core and working tiers). */
  roles: z.array(z.string()).default([]),
  /** Project slugs that evidence the skill. */
  projects: z.array(z.string()).default([]),
  /** Lowercase tag used by the /projects filters and the API. */
  tag: z.string().optional(),
});
export type Skill = z.infer<typeof skillSchema>;

export const skillGroupSchema = z.object({
  pillar: z.string().min(1),
  skills: z.array(skillSchema).min(1),
});
export type SkillGroup = z.infer<typeof skillGroupSchema>;

/* ------------------------------------------------------------------ */
/* Site copy                                                           */
/* ------------------------------------------------------------------ */

export const gatedTextSchema = z.object({ text: z.string().min(1), gate: gateSchema.optional() });
export type GatedText = z.infer<typeof gatedTextSchema>;

export const proofPointSchema = z.object({
  text: z.string().min(1),
  gate: gateSchema.optional(),
  /** Project slug the proof point links to, when a case study exists. */
  project: z.string().optional(),
});
export type ProofPoint = z.infer<typeof proofPointSchema>;

export const pillarCardSchema = z.object({
  pillar: pillarSchema,
  title: z.string().min(1),
  blurb: z.array(gatedTextSchema).min(1),
  proofPoints: z.array(proofPointSchema).min(1),
});
export type PillarCard = z.infer<typeof pillarCardSchema>;

export const siteSchema = z.object({
  name: z.string().min(1),
  initials: z.string().min(1).max(3),
  role: z.string().min(1),
  employer: z.string().min(1),
  titleLine: z.string().min(1),
  seo: z.object({ title: z.string().min(1), description: z.string().min(1).max(200) }),
  location: z.string().min(1),
  links: z.object({ linkedin: z.url(), github: z.url(), source: z.url() }),
  lastVerifiedAgainstLinkedIn: isoDate,
  flags: z.object({
    omegaApproved: z.boolean(),
    securityReviewApproved: z.boolean(),
    albanyConfirmed: z.boolean(),
    explicitAvailability: z.boolean(),
  }),
  availability: z.object({ neutral: z.string().min(1), explicit: z.string().min(1) }),
  headline: z.object({ approved: z.string().min(1), fallback: z.string().min(1) }),
  heroBio: z.object({ approved: z.string().min(1), fallback: z.string().min(1) }),
  heroCta: z.object({
    primary: z.object({ label: z.string(), href: z.string() }),
    secondary: z.object({ label: z.string(), href: z.string() }),
  }),
  about: z.object({
    intro: z.string().min(1),
    current: z.object({ approved: z.string().min(1), fallback: z.string().min(1) }),
    securitySentence: z.string().min(1),
    earlier: z.string().min(1),
  }),
  pillars: z.array(pillarCardSchema).length(3),
  industries: z.array(z.string().min(1)),
  certifications: z.array(z.string().min(1)),
});
export type SiteContent = z.infer<typeof siteSchema>;
