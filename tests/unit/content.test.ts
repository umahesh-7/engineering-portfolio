import { describe, expect, it } from "vitest";
import { getExperience, getPosts, getProjects, isGateOpen, openBullets, site } from "@/lib/content";
import { FORBIDDEN_PATTERNS } from "../../scripts/check-public-output.mjs";

describe("content loaders", () => {
  it("loads every case study with valid frontmatter and a basis on every figure", () => {
    const projects = getProjects();
    expect(projects.length).toBeGreaterThanOrEqual(6);
    for (const project of projects) {
      expect(project.slug).toMatch(/^[a-z0-9-]+$/);
      for (const metric of project.outcomes) expect(metric.basis.kind).toMatch(/measured|stated/);
    }
  });

  it("loads posts newest first", () => {
    const posts = getPosts();
    expect(posts.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < posts.length; i += 1) {
      expect(
        posts[i - 1]?.publishedAt.localeCompare(posts[i]?.publishedAt ?? ""),
      ).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("content gates", () => {
  it("keeps current-employer detail closed until the flag is flipped", () => {
    expect(site.flags.omegaApproved).toBe(false);
    expect(isGateOpen("omega")).toBe(false);
    expect(isGateOpen("security")).toBe(false);
    const omega = getExperience().find((role) => role.slug === "omega-permits");
    expect(omega).toBeDefined();
    expect(openBullets(omega?.bullets ?? [])).toHaveLength(0);
  });

  it("shows resume-only bullets on the résumé view but not on the about view", () => {
    const nys = getExperience().find((role) => role.slug === "nys-its");
    expect(nys).toBeDefined();
    const about = openBullets(nys?.bullets ?? [], "about");
    const resume = openBullets(nys?.bullets ?? [], "resume");
    expect(resume.length).toBe(about.length + 1);
  });

  it("never carries contact data, scores or security findings in content", () => {
    const text = JSON.stringify([
      getExperience(),
      site,
      getProjects().map((p) => p.body),
      getPosts().map((p) => p.body),
    ]);
    for (const { name, regex } of FORBIDDEN_PATTERNS) {
      expect(regex.test(text), `content matches the ${name} pattern`).toBe(false);
    }
  });
});
