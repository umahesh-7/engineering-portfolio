import Link from "next/link";
import { Container } from "@/components/site/container";
import { GitHubIcon, LinkedInIcon, RssIcon } from "@/components/site/icons";
import { hasWriting, site } from "@/lib/content";
import { BUILD_DATE } from "@/lib/dates";
import { formatDate } from "@/lib/utils";

export function Footer() {
  const year = BUILD_DATE.getUTCFullYear();
  const showWriting = hasWriting();
  const columns: { title: string; links: { label: string; href: string; external?: boolean }[] }[] =
    [
      {
        title: "Explore",
        links: [
          { label: "Case studies", href: "/projects" },
          { label: "About", href: "/about" },
          ...(showWriting ? [{ label: "Writing", href: "/writing" }] : []),
          { label: "Résumé", href: "/resume" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        title: "For developers",
        links: [
          { label: "API documentation", href: "/api/docs" },
          { label: "Projects JSON API", href: "/api/v1/projects" },
          { label: "Health endpoint", href: "/api/health" },
          { label: "Site source", href: site.links.source, external: true },
        ],
      },
    ];

  return (
    <footer className="print:hidden border-border border-t bg-muted/40">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="font-semibold">{site.name}</p>
          <p className="mt-1 text-muted-foreground text-sm">{site.titleLine}</p>
          <div className="mt-4 flex items-center gap-2">
            <a
              href={site.links.linkedin}
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="LinkedIn profile (opens in a new tab)"
              rel="me noopener"
              target="_blank"
            >
              <LinkedInIcon className="size-4.5" />
            </a>
            <a
              href={site.links.github}
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="GitHub profile (opens in a new tab)"
              rel="me noopener"
              target="_blank"
            >
              <GitHubIcon className="size-4.5" />
            </a>
            {showWriting ? (
              <a
                href="/feed.xml"
                className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="RSS feed"
              >
                <RssIcon className="size-4.5" />
              </a>
            ) : null}
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="font-medium font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
              {column.title}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {column.links.map((link) =>
                link.external ? (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground"
                      rel="noopener"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.href}>
                    <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="flex flex-col gap-2 border-border border-t py-6 text-muted-foreground text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {site.name}. Site content all rights reserved; code under the MIT licence.
        </p>
        <p>
          Last verified against LinkedIn on {formatDate(site.lastVerifiedAgainstLinkedIn)}. Built
          with Next.js 16.
        </p>
      </Container>
    </footer>
  );
}
