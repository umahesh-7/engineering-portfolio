import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/site/container";
import { Toc } from "@/components/site/toc";
import { ViewCounter } from "@/components/site/view-counter";
import { getPost, getPosts, site } from "@/lib/content";
import { env } from "@/lib/env";
import { extractToc, renderMdx } from "@/lib/mdx";
import { formatDate } from "@/lib/utils";

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/writing/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      type: "article",
      siteName: site.name,
      locale: "en_US",
      title: post.title,
      description: post.summary,
      url: `/writing/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [site.name],
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PageProps<"/writing/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const content = await renderMdx(post.body);
  const toc = extractToc(post.body);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { "@type": "Person", name: site.name, url: env.NEXT_PUBLIC_SITE_URL },
    mainEntityOfPage: `${env.NEXT_PUBLIC_SITE_URL}/writing/${post.slug}`,
    keywords: post.tags.join(", "),
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
            href="/writing"
            className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
            All writing
          </Link>
          <h1 className="mt-6 max-w-4xl text-balance font-semibold text-headline tracking-tight">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">{post.summary}</p>
          <p className="mt-6 text-muted-foreground text-sm">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            {post.updatedAt ? <> · updated {formatDate(post.updatedAt)}</> : null} ·{" "}
            {post.readingMinutes} min read · <ViewCounter slug={`posts/${post.slug}`} /> views
          </p>
        </Container>
      </header>
      <Container className="grid gap-12 py-12 lg:grid-cols-[1fr_16rem] lg:py-16">
        <div className="prose min-w-0">{content}</div>
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Toc entries={toc} />
          </div>
        </aside>
      </Container>
    </article>
  );
}
