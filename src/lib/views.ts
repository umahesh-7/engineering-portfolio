import "server-only";

import { getRedis } from "@/lib/redis";

const KEY_PREFIX = "views:";

/** Returns null when counting is disabled (no Redis configured). */
export async function getViews(slug: string): Promise<number | null> {
  const redis = getRedis();
  if (!redis) return null;
  const value = await redis.get<number>(`${KEY_PREFIX}${slug}`);
  return value ?? 0;
}

export async function incrementViews(slug: string): Promise<number | null> {
  const redis = getRedis();
  if (!redis) return null;
  return redis.incr(`${KEY_PREFIX}${slug}`);
}
