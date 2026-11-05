import type { Metadata } from "next";
import { Container } from "@/components/site/container";
import { PrintButton } from "@/components/site/print-button";
import {
  getEducation,
  getExperience,
  getSkillGroups,
  isGateOpen,
  openBullets,
  site,
} from "@/lib/content";
import { BUILD_DATE, formatPeriod, yearsOfExperience } from "@/lib/dates";
import { env } from "@/lib/env";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Résumé",
  description:
    "Printable résumé of Mahesh Utlapalli, Senior Software Engineer: experience, education, certifications and skills.",
  alternates: { canonical: "/resume" },
};

export default function ResumePage() {
  const experience = getExperience();
  const education = getEducation();
  const groups = getSkillGroups();
  const years = yearsOfExperience(experience.map((role) => role.period));
  const siteHost = new URL(env.NEXT_PUBLIC_SITE_URL).host;

  const summary = [
    `Senior full-stack software engineer with over ${years} years of experience building and owning reliable, secure systems for regulated industries, including healthcare and government.`,
    "Works across the full stack, from React, Next.js, and TypeScript front ends to Node.js, Express, and Spring Boot services, with cloud-native deployment on AWS and Azure using Docker and Kubernetes.",
    isGateOpen("omega")
      ? "Most recently designed and shipped an automated permit pipeline from the ground up, replacing a manual intake process and cutting processing turnaround by around 60%."
      : "Currently builds public-sector permitting software at Omega Permits.",
    "Earlier work on healthcare platforms cut backend latency by 30% and pushed test coverage past 90%, keeping critical applications stable under real clinical load.",
  ].join(" ");

  return (
    <Container className="max-w-4xl py-12 print:max-w-none print:py-0">
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4 text-sm">
        <p className="text-muted-foreground">
          Generated from the site content. No phone number or email is printed; use the contact page
          or LinkedIn.
        </p>
        <PrintButton />
      </div>

      <header className="border-border border-b pb-6">
        <h1 className="font-semibold text-3xl tracking-tight">{site.name}</h1>
        <p className="mt-1 text-lg">{site.titleLine}</p>
        <p className="mt-2 text-muted-foreground text-sm">
          {site.location} · {siteHost} · linkedin.com/in/umahesh · github.com/umahesh-7
        </p>
      </header>

      <section aria-labelledby="resume-summary" className="mt-8">
        <h2
          id="resume-summary"
          className="font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]"
        >
          Summary
        </h2>
        <p className="mt-3 text-pretty">{summary}</p>
      </section>

      <section aria-labelledby="resume-experience" className="mt-8">
        <h2
          id="resume-experience"
          className="font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]"
        >
          Experience
        </h2>
        <ol className="mt-3 space-y-6">
          {experience.map((role) => {
            const bullets = openBullets(role.bullets, "resume");
            return (
              <li key={role.slug} className="print-break-inside-avoid">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="font-semibold">
                    {role.title}, {role.company}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {formatPeriod(role.period, role.displayStart)}
                  </p>
                </div>
                <p className="text-muted-foreground text-sm">{role.location}</p>
                {bullets.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {bullets.map((bullet) => (
                      <li key={bullet.text} className="text-pretty">
                        {bullet.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm">{role.summary}</p>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="resume-education" className="mt-8 print-break-inside-avoid">
        <h2
          id="resume-education"
          className="font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]"
        >
          Education
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {education.map((item) => (
            <li key={item.slug} className="flex flex-col sm:flex-row sm:justify-between">
              <span>
                <span className="font-semibold">{item.degree}</span>, {item.school}
              </span>
              <span className="text-muted-foreground">{item.period.end.slice(0, 4)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="resume-certifications" className="mt-8 print-break-inside-avoid">
        <h2
          id="resume-certifications"
          className="font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]"
        >
          Certifications
        </h2>
        <p className="mt-3 text-sm">{site.certifications.join(" · ")}</p>
      </section>

      <section aria-labelledby="resume-skills" className="mt-8 print-break-inside-avoid">
        <h2
          id="resume-skills"
          className="font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]"
        >
          Skills
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          {groups.map((group) => (
            <div key={group.pillar} className="grid gap-1 sm:grid-cols-[11rem_1fr]">
              <dt className="font-semibold">{group.pillar}</dt>
              <dd className="text-pretty">
                {group.skills
                  .filter((skill) => skill.tier !== "familiar")
                  .map((skill) => skill.name)
                  .join(", ")}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="mt-10 border-border border-t pt-4 text-muted-foreground text-xs">
        Generated on {formatDate(BUILD_DATE.toISOString().slice(0, 10))}; last verified against
        LinkedIn on {formatDate(site.lastVerifiedAgainstLinkedIn)}.
      </footer>
    </Container>
  );
}
