import { describe, expect, it } from "vitest";
import { FORBIDDEN_PATTERNS } from "../../scripts/check-public-output.mjs";

function matches(text: string): string[] {
  return FORBIDDEN_PATTERNS.filter(({ regex }) => regex.test(text)).map(({ name }) => name);
}

describe("leak-check patterns", () => {
  it("catches contact data, scores, security vocabulary and work-authorization statements", () => {
    expect(matches("call +1 (555) 010-0199")).toContain("phone number");
    expect(matches("call +1(555) -010-0199")).toContain("phone number");
    expect(matches("555.010.0199")).toContain("phone number");
    expect(matches("someone@example.com")).toContain("email address");
    expect(matches("GPA: 3.9")).toContain("academic score");
    expect(matches("3.8/4.0")).toContain("academic score");
    expect(matches("closing injection flaws")).toContain("security finding vocabulary");
    expect(matches("requires visa sponsorship")).toContain("work authorization");
  });

  it("ignores benign markup, versions, dates and large integers", () => {
    expect(matches("@theme inline { --x: 1 } @media (min-width: 1px)")).toEqual([]);
    expect(matches("react@19.3.1 next@16.4.5")).toEqual([]);
    expect(matches("Lighthouse 95, LCP 2.0 s, published 2026-11-05")).toEqual([]);
    expect(matches('"maximum":9007199254740991')).toEqual([]);
  });
});
