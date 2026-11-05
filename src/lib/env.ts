import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Canonical origin. An explicit NEXT_PUBLIC_SITE_URL wins; on Vercel the system variables supply the
 * production domain or the preview deployment URL; local development and CI fall back to the schema default.
 */
function siteUrl(): string | undefined {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const production =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  const vercelEnv = process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (vercelEnv === "production" && production) return `https://${production}`;
  const deployment = process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL;
  if (deployment) return `https://${deployment}`;
  return undefined;
}

/**
 * Every variable is optional: a missing value degrades the matching feature gracefully
 * (console email delivery in development, in-memory rate limiting, disabled view counts, skipped bot check).
 * Invalid values still fail the build.
 */
export const env = createEnv({
  server: {
    RESEND_API_KEY: z.string().min(1).optional(),
    CONTACT_TO_EMAIL: z.email().optional(),
    CONTACT_FROM_EMAIL: z.string().min(3).optional(),
    UPSTASH_REDIS_REST_URL: z.url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
    GITHUB_TOKEN: z.string().min(1).optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: siteUrl(),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});

// Turnstile only works as a pair: a site key without a secret would render a widget nobody verifies,
// and a secret without a site key would reject every submission for lack of a token.
if (
  typeof window === "undefined" &&
  process.env.SKIP_ENV_VALIDATION !== "true" &&
  Boolean(env.TURNSTILE_SECRET_KEY) !== Boolean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
) {
  throw new Error("Set both NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY, or neither.");
}
