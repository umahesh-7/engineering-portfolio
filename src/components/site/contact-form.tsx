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
import { type ContactInput, contactSchema, initialContactState } from "@/lib/contact-schema";

export function ContactForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [state, formAction, pending] = useActionState(submitContact, initialContactState);
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "", website: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      form.reset();
    } else if (state.status === "error" && !state.fieldErrors) {
      toast.error(state.message);
    }
  }, [state, form]);

  const onSubmit = form.handleSubmit((values) => {
    const data = new FormData();
    data.set("name", values.name);
    data.set("email", values.email);
    data.set("message", values.message);
    data.set("website", values.website ?? "");
    const token = formRef.current?.querySelector<HTMLInputElement>(
      'input[name="cf-turnstile-response"]',
    )?.value;
    if (token) data.set("cf-turnstile-response", token);
    startTransition(() => formAction(data));
  });

  const errors = form.formState.errors;
  const serverErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="space-y-5"
      aria-describedby={`${id}-status`}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${id}-name`} label="Name" error={errors.name?.message ?? serverErrors.name}>
          <Input
            id={`${id}-name`}
            autoComplete="name"
            aria-invalid={Boolean(errors.name || serverErrors.name)}
            aria-describedby={errors.name || serverErrors.name ? `${id}-name-error` : undefined}
            {...form.register("name")}
          />
        </Field>
        <Field id={`${id}-email`} label="Email" error={errors.email?.message ?? serverErrors.email}>
          <Input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(errors.email || serverErrors.email)}
            aria-describedby={errors.email || serverErrors.email ? `${id}-email-error` : undefined}
            {...form.register("email")}
          />
        </Field>
      </div>
      <Field
        id={`${id}-message`}
        label="Message"
        error={errors.message?.message ?? serverErrors.message}
      >
        <Textarea
          id={`${id}-message`}
          rows={6}
          aria-invalid={Boolean(errors.message || serverErrors.message)}
          aria-describedby={
            errors.message || serverErrors.message ? `${id}-message-error` : undefined
          }
          {...form.register("message")}
        />
      </Field>

      {/* Honeypot: hidden from people, visible to naive bots. */}
      <div
        className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          tabIndex={-1}
          autoComplete="off"
          {...form.register("website")}
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
          role="status"
          aria-live="polite"
          className="text-muted-foreground text-sm"
        >
          {state.status === "success"
            ? state.message
            : state.status === "error"
              ? state.message
              : ""}
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
