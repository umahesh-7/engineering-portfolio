import "server-only";

import { env } from "@/lib/env";

export interface TurnstileResult {
  ok: boolean;
  skipped: boolean;
}

/** Verifies a Cloudflare Turnstile token. Skipped (and passing) when no secret is configured. */
export async function verifyTurnstile(
  token: string | null | undefined,
  ip?: string,
): Promise<TurnstileResult> {
  if (!env.TURNSTILE_SECRET_KEY) return { ok: true, skipped: true };
  if (!token) return { ok: false, skipped: false };

  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    const data = (await response.json()) as { success?: boolean };
    return { ok: data.success === true, skipped: false };
  } catch {
    return { ok: false, skipped: false };
  }
}
