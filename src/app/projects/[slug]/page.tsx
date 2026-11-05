import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/site/container";
import { MetricStat } from "@/components/site/metric";
import { ProjectCard } from "@/components/site/project-card";
import { Toc } from "@/components/site/toc";
import { ViewCounter } from "@/components/site/view-counter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProject, getProjects, getRelatedProjects, site } from "@/lib/content";
import { env } from "@/lib/env";
import { extractToc, renderMdx } from "@/lib/mdx";
import { PILLAR_LABELS } from "@/lib/pillars";
import { toProjectCard } from "@/lib/tech";
import { formatDate, formatPeriod } from "@/lib/utils";

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      siteName: site.name,
      locale: "en_US",
      title: project.title,
      description: project.summary,
      url: `/projects/${project.slug}`,
      publishedTime: project.publishedAt,
      modifiedTime: project.updatedAt ?? project.publishedAt,
      authors: [site.name],
      tags: project.tags,
    },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const [content, related] = await Promise.all([
    renderMdx(project.body),
    Promise.resolve(getRelatedProjects(slug, 2).map(toProjectCard)),
  ]);
  const toc = extractToc(project.body);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    description: project.summary,
    datePublished: project.publishedAt,
    dateModified: project.updatedAt ?? project.publishedAt,
    author: { "@type": "Person", name: site.name, url: env.NEXT_PUBLIC_SITE_URL },
    mainEntityOfPage: `${env.NEXT_PUBLIC_SITE_URL}/projects/${project.slug}`,
    keywords: [...project.tags, ...project.stack].join(", "),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialised from trusted content with < escaped.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="border-border border-b bg-muted/30">
        <Container className="py-12 sm:py-16">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
            All case studies
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {project.pillars.map((pillar) => (
              <Badge
                key={pillar}
                variant={pillar === project.primaryPillar ? "secondary" : "outline"}
              >
                {PILLAR_LABELS[pillar]}
              </Badge>
            ))}
          </div>
          <h1 className="mt-4 max-w-4xl text-balance font-semibold text-headline tracking-tight">
            {project.title}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            {project.summary}
          </p>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Employer</dt>
              <dd className="mt-0.5">{project.employer}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Period</dt>
              <dd className="mt-0.5">{formatPeriod(project.period)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Published</dt>
              <dd className="mt-0.5">{formatDate(project.publishedAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                Reading time
              </dt>
              <dd className="mt-0.5">{project.readingMinutes} min</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Views</dt>
              <dd className="mt-0.5">
                <ViewCounter slug={`projects/${project.slug}`} />
              </dd>
            </div>
          </dl>
          {project.outcomes.length > 0 ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {project.outcomes.map((metric) => (
                <MetricStat key={`${metric.value}-${metric.label}`} metric={metric} />
              ))}
            </div>
          ) : null}
        </Container>
      </header>

      <Container className="grid gap-12 py-12 lg:grid-cols-[1fr_16rem] lg:py-16">
        <div className="prose min-w-0">{content}</div>
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <Toc entries={toc} />
            <div>
              <p className="font-medium font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
                Stack
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {project.stack.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {project.sourceLink ? (
              <Button asChild variant="outline" size="sm">
                <a href={project.sourceLink} rel="noopener" target="_blank">
                  View source
                  <ExternalLinkIcon aria-hidden="true" />
                </a>
              </Button>
            ) : (
              <p className="text-muted-foreground text-xs">
                The code behind this case study is proprietary to the employer named above.
              </p>
            )}
          </div>
        </aside>
      </Container>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="border-border border-t bg-muted/30">
          <Container className="py-12 lg:py-16">
            <h2 id="related-heading" className="font-semibold text-title tracking-tight">
              Related case studies
            </h2>
            <ul className="mt-6 grid gap-6 md:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <ProjectCard project={item} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </article>
  );
}
