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

/**
 * Client key for rate limiting. Prefers X-Real-IP, which Vercel (and a correctly configured reverse proxy)
 * sets from the connection rather than from the request, then the hop appended by the nearest proxy,
 * which is the rightmost X-Forwarded-For entry; the leftmost hop is attacker-controlled. Falls back to a
 * single bucket so limits still apply in local development.
 */
export function clientKey(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const hops = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((hop) => hop.trim())
    .filter(Boolean);
  return hops[hops.length - 1] ?? "local";
}
