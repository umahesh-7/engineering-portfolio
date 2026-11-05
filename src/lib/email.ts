import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface DeliveryResult {
  /** False when no delivery provider is configured on this deployment. */
  configured: boolean;
  delivered: boolean;
  id?: string;
}

/** Collapses control characters so a crafted name cannot break the subject line. */
function singleLine(value: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: the control characters are the strings being stripped
  return value.replace(/[\r\n\t\u0000-\u001f\u007f]+/g, " ").trim();
}

/**
 * Sends through Resend when configured. Without configuration the message is logged in development only;
 * in production nothing is logged beyond the fact that delivery is unconfigured, and the caller reports an error.
 */
export async function sendContactEmail(input: ContactMessage): Promise<DeliveryResult> {
  const subject = `Portfolio contact from ${singleLine(input.name)}`;
  const text = [`From: ${singleLine(input.name)} <${input.email}>`, "", input.message].join("\n");

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) {
    if (env.NODE_ENV === "production") {
      console.warn("[contact] Email delivery is not configured; a message could not be delivered.");
    } else {
      console.info(
        `[contact] Email delivery not configured. Message received:\n${subject}\n${text}`,
      );
    }
    return { configured: false, delivered: false };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
    to: [env.CONTACT_TO_EMAIL],
    replyTo: input.email,
    subject,
    text,
  });
  if (error) throw new Error(error.message);
  return { configured: true, delivered: true, id: data?.id };
}
