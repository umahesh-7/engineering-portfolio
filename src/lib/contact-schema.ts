import * as z from "zod/mini";

/**
 * Written with zod/mini so the contact page ships a few kilobytes of validation instead of the full
 * library. The server action uses the full schema; the browser validates only the fields a person fills in.
 */
const name = z
  .string()
  .check(
    z.trim(),
    z.minLength(2, "Please enter your name."),
    z.maxLength(80, "Keep the name under 80 characters."),
    z.regex(/^[^\r\n]*$/, "The name cannot contain line breaks."),
  );

const email = z
  .email("Please enter a valid email address.")
  .check(z.maxLength(254, "That email address is too long."));

const message = z
  .string()
  .check(
    z.trim(),
    z.minLength(10, "Say a little more, at least 10 characters."),
    z.maxLength(2000, "Keep the message under 2000 characters."),
  );

export const contactClientSchema = z.object({ name, email, message });

export const contactSchema = z.object({
  name,
  email,
  message,
  /** Honeypot: people never see this field, so it must stay empty. Validated on the server only. */
  website: z.optional(z.string().check(z.maxLength(0))),
  turnstileToken: z.optional(z.string()),
});

export type ContactInput = z.infer<typeof contactClientSchema>;

export type ContactField = "name" | "email" | "message";

export interface ContactState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  delivered?: boolean;
}

export const initialContactState: ContactState = { status: "idle" };
