import { Ratelimit } from "@upstash/ratelimit";
import type { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  /** Unix epoch milliseconds when the window resets. */
  reset: number;
}

export interface RateLimiter {
  limit(key: string): Promise<RateLimitResult>;
}

export interface RateLimitOptions {
  prefix: string;
  /** Requests allowed per window. */
  limit: number;
  windowMs: number;
}

/** Sliding-window limiter kept in process memory. Used in development and as a fallback when Redis is absent. */
export function createMemoryRateLimiter(
  options: RateLimitOptions,
  now: () => number = () => Date.now(),
): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    async limit(key) {
      const current = now();
      const windowStart = current - options.windowMs;
      const recent = (hits.get(key) ?? []).filter((timestamp) => timestamp > windowStart);
      const success = recent.length < options.limit;
      if (success) recent.push(current);
      hits.set(key, recent);
      if (hits.size > 10_000) {
        for (const [entryKey, timestamps] of hits) {
          if (!timestamps.some((timestamp) => timestamp > windowStart)) hits.delete(entryKey);
        }
      }
      const oldest = recent[0] ?? current;
      return {
        success,
        remaining: Math.max(0, options.limit - recent.length),
        reset: oldest + options.windowMs,
      };
    },
  };
}

/** Durable limiter backed by Upstash Redis, shared across serverless instances. */
export function createRedisRateLimiter(redis: Redis, options: RateLimitOptions): RateLimiter {
  const limiter = new Ratelimit({
    redis,
    prefix: `ratelimit:${options.prefix}`,
    limiter: Ratelimit.slidingWindow(
      options.limit,
      `${Math.max(1, Math.round(options.windowMs / 1000))} s`,
    ),
    analytics: false,
  });
  return {
    async limit(key) {
      const result = await limiter.limit(key);
      return { success: result.success, remaining: result.remaining, reset: result.reset };
    },
  };
}

export function createRateLimiter(redis: Redis | null, options: RateLimitOptions): RateLimiter {
  return redis ? createRedisRateLimiter(redis, options) : createMemoryRateLimiter(options);
}

/** First hop of X-Forwarded-For, or a stable placeholder so limits still apply locally. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || headers.get("x-real-ip") || "local";
}
