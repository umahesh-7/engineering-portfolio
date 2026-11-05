import { ArrowRightIcon, PrinterIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/container";
import { Section } from "@/components/site/section";
import { SkillsMatrix } from "@/components/site/skills-matrix";
import { Timeline } from "@/components/site/timeline";
import { Button } from "@/components/ui/button";
import { getEducation, getExperience, getSkillGroups, isGateOpen, site } from "@/lib/content";
import { yearsOfExperience } from "@/lib/dates";
import { env } from "@/lib/env";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "Senior full-stack software engineer: experience timeline across government, healthcare and public-sector permitting, a tiered skills matrix, education and certifications.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const experience = getExperience();
  const education = getEducation();
  const skills = getSkillGroups();
  const years = yearsOfExperience(experience.map((role) => role.period));
  const current = site.flags.omegaApproved
    ? site.about.current.approved
    : site.about.current.fallback;
  const showSecurity = isGateOpen("security");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    worksFor: { "@type": "Organization", name: site.employer },
    url: env.NEXT_PUBLIC_SITE_URL,
    sameAs: [site.links.linkedin, site.links.github],
    address: { "@type": "PostalAddress", addressRegion: "Massachusetts", addressCountry: "US" },
    alumniOf: education.map((item) => ({ "@type": "EducationalOrganization", name: item.school })),
    knowsAbout: skills.flatMap((group) =>
      group.skills.filter((s) => s.tier === "core").map((s) => s.name),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialised from trusted content with < escaped.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <section aria-labelledby="about-heading" className="border-border border-b bg-muted/30">
        <Container className="grid gap-10 py-16 lg:grid-cols-[1fr_18rem] lg:py-20">
          <div>
            <p className="font-medium font-mono text-primary text-xs uppercase tracking-[0.2em]">
              About
            </p>
            <h1 id="about-heading" className="mt-4 font-semibold text-headline tracking-tight">
              {site.name}
            </h1>
            <p className="mt-2 text-muted-foreground">{site.titleLine}</p>
            <div className="prose mt-8">
              <p>{site.about.intro}</p>
              <p>
                {current}
                {showSecurity ? ` ${site.about.securitySentence}` : ""}
              </p>
              <p>{site.about.earlier}</p>
            </div>
          </div>
          <div className="grid h-fit gap-4 rounded-xl border border-border bg-card p-6 shadow-card">
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                  Experience
                </dt>
                <dd className="mt-1 font-mono font-semibold text-2xl">{years}+ years</dd>
                <dd className="text-muted-foreground text-xs">computed from the timeline below</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">Based in</dt>
                <dd className="mt-1">{site.location}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                  Industries
                </dt>
                <dd className="mt-1 text-sm">{site.industries.join(" · ")}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/resume">
                <PrinterIcon aria-hidden="true" />
                Printable résumé
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      <Section
        id="experience"
        eyebrow="Timeline"
        title="Experience and education"
        description="Roles and degrees in one timeline. Bullet wording follows the résumé; current-employer detail appears once its publication is approved."
      >
        <Timeline experience={experience} education={education} />
      </Section>

      <Section
        id="skills"
        eyebrow="Skills"
        title="A matrix with evidence, not a wall of logos"
        description="Chips link to the case study that evidences the skill where one exists; hover a chip to see the roles behind it."
        className="border-border border-t bg-muted/30"
      >
        <SkillsMatrix groups={skills} />
      </Section>

      <Section id="credentials" eyebrow="Credentials" title="Education and certifications">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="font-semibold text-lg tracking-tight">Education</h3>
            <ul className="mt-4 space-y-4">
              {education.map((item) => (
                <li key={item.slug} className="rounded-lg border border-border bg-card p-4">
                  <p className="font-medium">{item.degree}</p>
                  <p className="text-muted-foreground text-sm">
                    {item.school} · {item.period.end.slice(0, 4)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg tracking-tight">Certifications</h3>
            <ul className="mt-4 space-y-2">
              {site.certifications.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-muted-foreground text-xs">
              Listed as on LinkedIn, last verified on {formatDate(site.lastVerifiedAgainstLinkedIn)}
              .
            </p>
          </div>
        </div>
        <div className="mt-10">
          <Button asChild>
            <Link href="/projects">
              See the case studies
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
