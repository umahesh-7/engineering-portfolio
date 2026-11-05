import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(80, "Keep the name under 80 characters."),
  email: z.email("Please enter a valid email address.").max(254),
  message: z
    .string()
    .trim()
    .min(10, "Say a little more, at least 10 characters.")
    .max(2000, "Keep the message under 2000 characters."),
  /** Honeypot: humans never see this field, so it must stay empty. */
  website: z.string().max(0).optional(),
  turnstileToken: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactField = "name" | "email" | "message";

export interface ContactState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  delivered?: boolean;
}

export const initialContactState: ContactState = { status: "idle" };
