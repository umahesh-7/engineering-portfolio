import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/site/container";
import { PillarCard } from "@/components/site/pillar-card";
import { ProjectCard } from "@/components/site/project-card";
import { Section } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { getFeaturedProjects, getPosts, site } from "@/lib/content";
import { toProjectCard } from "@/lib/tech";
import { formatDate } from "@/lib/utils";

export default function HomePage() {
  const approved = site.flags.omegaApproved;
  const headline = approved ? site.headline.approved : site.headline.fallback;
  const bio = approved ? site.heroBio.approved : site.heroBio.fallback;
  const availability = site.flags.explicitAvailability
    ? site.availability.explicit
    : site.availability.neutral;
  const featured = getFeaturedProjects(3).map(toProjectCard);
  const posts = getPosts().slice(0, 3);

  return (
    <>
      <section aria-labelledby="hero-heading" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="-z-10 pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_0%,var(--accent)_0%,transparent_70%)] opacity-70 dark:opacity-40"
        />
        <Container className="py-20 sm:py-28 lg:py-32">
          <p className="font-medium font-mono text-primary text-xs uppercase tracking-[0.2em]">
            {site.titleLine}
          </p>
          <h1
            id="hero-heading"
            className="mt-5 max-w-4xl text-balance font-semibold text-display tracking-tight"
          >
            {headline}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">{bio}</p>
          <div className="mt-8 flex animate-fade-up flex-wrap gap-3 ">
            <Button asChild size="lg">
              <Link href={site.heroCta.primary.href}>
                {site.heroCta.primary.label}
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={site.heroCta.secondary.href}>{site.heroCta.secondary.label}</Link>
            </Button>
          </div>
          <p className="mt-8 inline-flex animate-fade-up items-center gap-2 text-muted-foreground text-sm [animation-delay:80ms]">
            <span className="size-2 rounded-full bg-success" aria-hidden="true" />
            {availability}
          </p>
          <ul
            className="mt-6 flex animate-fade-up flex-wrap gap-2 [animation-delay:160ms]"
            aria-label="Industries"
          >
            {site.industries.map((industry) => (
              <li
                key={industry}
                className="rounded-full border border-border bg-background/60 px-3 py-1 text-muted-foreground text-xs"
              >
                {industry}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Section
        id="pillars"
        eyebrow="What I do"
        title="Three disciplines, one accountable engineer"
        description="Each card links to the case study behind the claim. Figures carry the hedge the source documents use and are shown with their basis, and each case study states what it does not claim."
        className="border-border border-t bg-muted/30"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {site.pillars.map((card) => (
            <div key={card.pillar} className="reveal h-full">
              <PillarCard card={card} />
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="featured"
        eyebrow="Selected work"
        title="Case studies"
        description="Former-employer work with measurable outcomes. This site is written up as a case study of its own, linked from the UI engineering card."
        action={
          <Button asChild variant="outline">
            <Link href="/projects">
              All case studies
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <div key={project.slug} className="reveal h-full">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </Section>

      {posts.length > 0 ? (
        <Section
          id="writing"
          eyebrow="Writing"
          title="Notes from building things"
          className="border-border border-t bg-muted/30"
          action={
            <Button asChild variant="outline">
              <Link href="/writing">All writing</Link>
            </Button>
          }
        >
          <ul className="grid gap-4 md:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/writing/${post.slug}`}
                  className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-colors hover:border-primary/50"
                >
                  <p className="text-muted-foreground text-xs">
                    {formatDate(post.publishedAt)} · {post.readingMinutes} min read
                  </p>
                  <h3 className="mt-2 font-semibold text-title tracking-tight">{post.title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm">{post.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <section aria-labelledby="cta-heading" className="border-border border-t">
        <Container className="flex flex-col items-start gap-6 py-16 sm:flex-row sm:items-center sm:justify-between lg:py-20">
          <div>
            <h2 id="cta-heading" className="font-semibold text-headline tracking-tight">
              Working on something that has to be right?
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Reliability, compliance and real impact are the problems I like. Send a note and I
              will reply from my own inbox.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/contact">Get in touch</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
