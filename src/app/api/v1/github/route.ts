import { connection } from "next/server";
import { json, preflight } from "@/lib/api";
import { getGithubActivity } from "@/lib/github";

export async function GET() {
  await connection();
  const activity = await getGithubActivity();
  return json(activity, {
    cache:
      activity.source === "live"
        ? "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
        : "no-store",
  });
}

export function OPTIONS() {
  return preflight();
}
