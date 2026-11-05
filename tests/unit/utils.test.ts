import { describe, expect, it } from "vitest";
import { formatDuration, yearsOfExperience } from "@/lib/dates";
import { techTag } from "@/lib/tech";
import { formatDate, formatMonth, monthsBetween, slugify } from "@/lib/utils";

describe("date helpers", () => {
  it("formats months, years and present", () => {
    expect(formatMonth("2024-07")).toBe("Jul 2024");
    expect(formatMonth("2023")).toBe("2023");
    expect(formatMonth("present")).toBe("Present");
  });

  it("formats ISO dates for a US audience without timezone drift", () => {
    expect(formatDate("2026-11-05")).toBe("November 5, 2026");
  });

  it("counts inclusive months and resolves present against a clock", () => {
    const now = new Date(Date.UTC(2026, 10, 5));
    expect(monthsBetween("2024-07", "2025-08", now)).toBe(14);
    expect(monthsBetween("2025-09", "present", now)).toBe(15);
  });

  it("computes whole years from the timeline", () => {
    expect(
      yearsOfExperience([
        { start: "2019-08", end: "2021-07" },
        { start: "2023-08", end: "2024-01" },
      ]),
    ).toBe(2);
  });

  it("formats durations", () => {
    expect(formatDuration({ start: "2019-08", end: "2021-07" })).toBe("2 yrs");
    expect(formatDuration({ start: "2024-02", end: "2024-06" })).toBe("5 mos");
  });
});

describe("slugify and techTag", () => {
  it("slugifies names", () => {
    expect(slugify("Spring Boot")).toBe("spring-boot");
    expect(slugify("C#")).toBe("c");
  });

  it("maps stack names to the filter vocabulary", () => {
    expect(techTag("Node.js")).toBe("nodejs");
    expect(techTag("Next.js")).toBe("nextjs");
    expect(techTag("REST APIs")).toBe("rest-api");
    expect(techTag("React Native")).toBe("react-native");
    expect(techTag(".NET")).toBe("dotnet");
  });
});
