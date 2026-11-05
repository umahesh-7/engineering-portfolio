import { connection } from "next/server";
import { env } from "@/lib/env";
import { getRedis } from "@/lib/redis";

type Check = "ok" | "disabled" | "error";

async function checkRedis(): Promise<Check> {
  const redis = getRedis();
  if (!redis) return "disabled";
  try {
    const result = await Promise.race([
      redis.ping(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
    ]);
    return result === "PONG" ? "ok" : "error";
  } catch {
    return "error";
  }
}

export async function GET() {
  await connection();
  const redis = await checkRedis();
  const status = redis === "error" ? "degraded" : "ok";
  return Response.json(
    {
      status,
      version: env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? "dev",
      time: new Date().toISOString(),
      checks: { redis },
    },
    { status: status === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
