"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon, SendIcon } from "lucide-react";
import Script from "next/script";
import { startTransition, useActionState, useEffect, useId, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { submitContact } from "@/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type ContactInput, contactClientSchema, initialContactState } from "@/lib/contact-schema";

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string | HTMLElement) => void };
  }
}

export function ContactForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [state, formAction, pending] = useActionState(submitContact, initialContactState);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const id = useId();
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactClientSchema),
    defaultValues: { name: "", email: "", message: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (state.status === "idle") return;
    if (state.status === "success") {
      toast.success(state.message);
      form.reset();
      window.turnstile?.reset();
    } else if (!state.fieldErrors) {
      toast.error(state.message);
      window.turnstile?.reset();
    }
    // Keyboard and screen-reader users land on the outcome instead of losing focus to the page body.
    statusRef.current?.focus();
  }, [state, form]);

  // With JavaScript, react-hook-form validates first and then posts the real form data through the server
  // action. Without JavaScript the form still posts to the same action thanks to action and method below.
  const onSubmit = form.handleSubmit(() => {
    const element = formRef.current;
    if (!element) return;
    const data = new FormData(element);
    startTransition(() => formAction(data));
  });

  const errors = form.formState.errors;
  const serverErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const nameError = errors.name?.message ?? serverErrors.name;
  const emailError = errors.email?.message ?? serverErrors.email;
  const messageError = errors.message?.message ?? serverErrors.message;

  return (
    <form
      ref={formRef}
      action={formAction}
      method="post"
      onSubmit={onSubmit}
      noValidate
      className="space-y-5"
      aria-describedby={`${id}-status`}
    >
      <p className="text-muted-foreground text-sm">All fields are required.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${id}-name`} label="Name" error={nameError}>
          <Input
            id={`${id}-name`}
            autoComplete="name"
            required
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? `${id}-name-error` : undefined}
            {...form.register("name")}
          />
        </Field>
        <Field id={`${id}-email`} label="Email" error={emailError}>
          <Input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? `${id}-email-error` : undefined}
            {...form.register("email")}
          />
        </Field>
      </div>
      <Field id={`${id}-message`} label="Message" error={messageError}>
        <Textarea
          id={`${id}-message`}
          rows={6}
          required
          aria-invalid={Boolean(messageError)}
          aria-describedby={messageError ? `${id}-message-error` : undefined}
          {...form.register("message")}
        />
      </Field>

      {/* Honeypot: hidden from people, visible to naive bots. Not validated in the browser so autofill cannot block a real person. */}
      <div
        className="-left-[9999px] absolute top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {turnstileSiteKey ? (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="lazyOnload"
          />
          <div
            className="cf-turnstile"
            data-sitekey={turnstileSiteKey}
            data-theme="auto"
            data-size="flexible"
          />
        </>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
          ) : (
            <SendIcon aria-hidden="true" />
          )}
          {pending ? "Sending…" : "Send message"}
        </Button>
        <p
          id={`${id}-status`}
          ref={statusRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className="text-muted-foreground text-sm outline-none"
        >
          {state.status === "success" || state.status === "error" ? state.message : ""}
        </p>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
