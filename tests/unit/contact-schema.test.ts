import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact-schema";

describe("contactSchema", () => {
  const valid = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Hello, I would like to talk about a role.",
  };

  it("accepts a valid message", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects short messages and bad addresses", () => {
    expect(contactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(contactSchema.safeParse({ ...valid, website: "https://spam.example" }).success).toBe(
      false,
    );
  });
});
