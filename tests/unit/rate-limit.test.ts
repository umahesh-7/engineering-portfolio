import { describe, expect, it } from "vitest";
import { clientKey, createMemoryRateLimiter } from "@/lib/rate-limit";

describe("createMemoryRateLimiter", () => {
  it("allows up to the limit inside a window and blocks the next request", async () => {
    let now = 1_000_000;
    const limiter = createMemoryRateLimiter({ prefix: "t", limit: 3, windowMs: 60_000 }, () => now);
    expect((await limiter.limit("a")).success).toBe(true);
    expect((await limiter.limit("a")).success).toBe(true);
    const third = await limiter.limit("a");
    expect(third.success).toBe(true);
    expect(third.remaining).toBe(0);
    const fourth = await limiter.limit("a");
    expect(fourth.success).toBe(false);
    expect(fourth.reset).toBe(1_000_000 + 60_000);
    now += 60_001;
    expect((await limiter.limit("a")).success).toBe(true);
  });

  it("keeps keys independent", async () => {
    const limiter = createMemoryRateLimiter({ prefix: "t", limit: 1, windowMs: 60_000 }, () => 5);
    expect((await limiter.limit("a")).success).toBe(true);
    expect((await limiter.limit("b")).success).toBe(true);
    expect((await limiter.limit("a")).success).toBe(false);
  });
});

describe("clientKey", () => {
  it("prefers the platform-set x-real-ip over client-controlled forwarding headers", () => {
    expect(
      clientKey(new Headers({ "x-real-ip": "198.51.100.2", "x-forwarded-for": "203.0.113.9" })),
    ).toBe("198.51.100.2");
  });

  it("uses the hop appended by the nearest proxy, not a spoofable first hop", () => {
    expect(clientKey(new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }))).toBe("10.0.0.1");
    expect(clientKey(new Headers())).toBe("local");
  });
});
