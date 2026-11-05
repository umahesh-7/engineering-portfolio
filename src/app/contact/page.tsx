import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { Container } from "@/components/site/container";
import { GitHubIcon, LinkedInIcon } from "@/components/site/icons";
import { Toaster } from "@/components/ui/sonner";
import { site } from "@/lib/content";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Send a message to Mahesh Utlapalli about reliability-focused full-stack, backend or platform work.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const availability = site.flags.explicitAvailability
    ? site.availability.explicit
    : site.availability.neutral;
  return (
    <Container className="grid gap-12 py-16 lg:grid-cols-[1fr_20rem] lg:py-20">
      <div>
        <p className="font-medium font-mono text-primary text-xs uppercase tracking-[0.2em]">
          Contact
        </p>
        <h1 className="mt-4 font-semibold text-headline tracking-tight">Send a message</h1>
        <p className="mt-4 max-w-xl text-pretty text-muted-foreground">
          Messages go straight to my own inbox and are not stored anywhere else. The form is
          protected by a rate limit and a bot check, and I reply from my own address.
        </p>
        <div className="mt-8">
          <ContactForm turnstileSiteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
          <Toaster />
        </div>
      </div>
      <aside className="space-y-6 lg:pt-14">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <p className="font-medium font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
            Elsewhere
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={site.links.linkedin}
                className="inline-flex items-center gap-2 hover:text-primary"
                rel="me noopener"
                target="_blank"
              >
                <LinkedInIcon className="size-4" />
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={site.links.github}
                className="inline-flex items-center gap-2 hover:text-primary"
                rel="me noopener"
                target="_blank"
              >
                <GitHubIcon className="size-4" />
                GitHub
              </a>
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <p className="font-medium font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
            Right now
          </p>
          <p className="mt-3 text-sm">{availability}</p>
        </div>
      </aside>
    </Container>
  );
}
