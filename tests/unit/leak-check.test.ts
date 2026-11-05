import { describe, expect, it } from "vitest";
import { FORBIDDEN_PATTERNS } from "../../scripts/check-public-output.mjs";

function matches(text: string): string[] {
  return FORBIDDEN_PATTERNS.filter(({ regex }) => regex.test(text)).map(({ name }) => name);
}

describe("leak-check patterns", () => {
  it("catches contact data, scores and audit details", () => {
    expect(matches("call +1 (838) 900-9067")).toContain("phone number");
    expect(matches("someone@example.com")).toContain("email address");
    expect(matches("GPA: 3.55")).toContain("GPA");
    expect(matches("closing open redirect vulnerabilities")).toContain("security audit detail");
    expect(matches("requires visa sponsorship")).toContain("work authorization");
  });

  it("ignores benign markup and version strings", () => {
    expect(matches("@theme inline { --x: 1 } @media (min-width: 1px)")).toEqual([]);
    expect(matches("react@19.3.1 next@16.4.5")).toEqual([]);
    expect(matches("Lighthouse 95, LCP 2.0 s")).toEqual([]);
  });
});
