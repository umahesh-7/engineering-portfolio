import "server-only";

import { cacheLife } from "next/cache";
import { env } from "@/lib/env";

export const GITHUB_USER = "umahesh-7";

export interface GithubRepo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  pushedAt: string;
}

export interface GithubActivity {
  source: "live" | "unavailable";
  user: string;
  repos: GithubRepo[];
}

interface RepoResponse {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
}

/** Recently pushed public repositories, cached for an hour. Works without a token; a token only raises the rate limit. */
export async function fetchGithubActivity(): Promise<GithubActivity> {
  "use cache";
  cacheLife("hours");

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "engineering-portfolio",
  };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;

  const response = await fetch(
    `https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=6&type=owner`,
    {
      headers,
      signal: AbortSignal.timeout(8000),
    },
  );
  if (!response.ok) throw new Error(`GitHub responded ${response.status}`);
  const repos = (await response.json()) as RepoResponse[];
  return {
    source: "live",
    user: GITHUB_USER,
    repos: repos
      .filter((repo) => !repo.fork)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        pushedAt: repo.pushed_at,
      })),
  };
}

export async function getGithubActivity(): Promise<GithubActivity> {
  try {
    return await fetchGithubActivity();
  } catch (error) {
    console.warn("[github] activity unavailable:", error instanceof Error ? error.message : error);
    return { source: "unavailable", user: GITHUB_USER, repos: [] };
  }
}
