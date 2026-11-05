"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { type ContactField, type ContactState, contactSchema } from "@/lib/contact-schema";
import { sendContactEmail } from "@/lib/email";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { getRedis } from "@/lib/redis";
import { verifyTurnstile } from "@/lib/turnstile";

const limiter = createRateLimiter(getRedis(), {
  prefix: "contact",
  limit: 5,
  windowMs: 10 * 60 * 1000,
});

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function submitContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: field(formData, "name"),
    email: field(formData, "email"),
    message: field(formData, "message"),
    website: field(formData, "website"),
    turnstileToken: field(formData, "cf-turnstile-response") || undefined,
  });

  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    const fieldErrors: Partial<Record<ContactField, string>> = {};
    for (const key of ["name", "email", "message"] as const) {
      const first = flat.fieldErrors[key]?.[0];
      if (first) fieldErrors[key] = first;
    }
    if (flat.fieldErrors.website) {
      // Honeypot filled in: answer as if delivered, without sending anything.
      return {
        status: "success",
        message: "Thanks, your message has been received.",
        delivered: false,
      };
    }
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };
  }

  const requestHeaders = await headers();
  const key = clientKey(requestHeaders);

  const rate = await limiter.limit(key);
  if (!rate.success) {
    const minutes = Math.max(1, Math.ceil((rate.reset - Date.now()) / 60_000));
    return {
      status: "error",
      message: `Too many messages from this network. Please try again in about ${minutes} minute${minutes > 1 ? "s" : ""}.`,
    };
  }

  const bot = await verifyTurnstile(parsed.data.turnstileToken, key === "local" ? undefined : key);
  if (!bot.ok) {
    return {
      status: "error",
      message: "The bot check did not pass. Reload the page and try again.",
    };
  }

  try {
    const result = await sendContactEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    });
    return {
      status: "success",
      message: result.delivered
        ? "Thanks, your message is on its way. I reply from my own inbox."
        : "Thanks, your message has been received.",
      delivered: result.delivered,
    };
  } catch (error) {
    console.error("[contact] delivery failed", error);
    return {
      status: "error",
      message:
        "The message could not be sent right now. Please try again later or reach me on LinkedIn.",
    };
  }
}
