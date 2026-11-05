import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface DeliveryResult {
  delivered: boolean;
  id?: string;
}

/** Sends through Resend when configured; otherwise logs to the server console so local development works. */
export async function sendContactEmail(input: ContactMessage): Promise<DeliveryResult> {
  const subject = `Portfolio contact from ${input.name}`;
  const text = [`From: ${input.name} <${input.email}>`, "", input.message].join("\n");

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) {
    console.info(`[contact] Email delivery not configured. Message received:\n${subject}\n${text}`);
    return { delivered: false };
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
  return { delivered: true, id: data?.id };
}
