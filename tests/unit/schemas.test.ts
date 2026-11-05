import { describe, expect, it } from "vitest";
import {
  metricSchema,
  PUBLIC_PROJECT_KEYS,
  projectFrontmatterSchema,
  publicProjectSchema,
} from "@/lib/schemas";
import { PUBLIC_KEYS } from "../../scripts/check-public-output.mjs";

describe("metricSchema", () => {
  it("rejects a figure without a basis", () => {
    expect(metricSchema.safeParse({ value: "45%", label: "UI responsiveness" }).success).toBe(
      false,
    );
  });

  it("accepts a stated basis and a measured basis", () => {
    expect(
      metricSchema.safeParse({
        value: "45%",
        label: "x",
        basis: { kind: "stated", source: "both" },
      }).success,
    ).toBe(true);
    expect(
      metricSchema.safeParse({
        value: "1.2s",
        label: "LCP",
        basis: { kind: "measured", what: "p75 LCP" },
      }).success,
    ).toBe(true);
  });
});

describe("projectFrontmatterSchema", () => {
  const valid = {
    title: "A case study",
    summary: "A summary that is long enough to pass the minimum length check.",
    employer: "Employer",
    period: { start: "2024-07", end: "present" },
    primaryPillar: "backend",
    pillars: ["backend"],
    stack: ["Node.js"],
    publishedAt: "2026-11-05",
  };

  it("applies defaults", () => {
    const parsed = projectFrontmatterSchema.parse(valid);
    expect(parsed.draft).toBe(false);
    expect(parsed.featured).toBe(false);
    expect(parsed.outcomes).toEqual([]);
    expect(parsed.order).toBe(100);
  });

  it("rejects malformed periods and dates", () => {
    expect(
      projectFrontmatterSchema.safeParse({
        ...valid,
        period: { start: "July 2024", end: "present" },
      }).success,
    ).toBe(false);
    expect(
      projectFrontmatterSchema.safeParse({ ...valid, publishedAt: "05/11/2026" }).success,
    ).toBe(false);
  });
});

describe("published allowlist", () => {
  it("keeps the leak-check allowlist in sync with the published schema", () => {
    expect([...PUBLIC_KEYS].sort()).toEqual([...PUBLIC_PROJECT_KEYS].sort());
  });

  it("strips keys that are not in the allowlist", () => {
    const parsed = publicProjectSchema.parse({
      slug: "x",
      title: "x",
      summary: "x",
      employer: "x",
      period: { start: "2024", end: "present" },
      primaryPillar: "ui",
      pillars: ["ui"],
      stack: [],
      tags: [],
      outcomes: [],
      url: "https://example.com/projects/x",
      publishedAt: "2026-11-05",
      draft: true,
      gate: "omega",
    });
    expect(parsed).not.toHaveProperty("draft");
    expect(parsed).not.toHaveProperty("gate");
  });
});
