import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/site/section";
import { getPosts } from "@/lib/content";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes on building reliable software: testing, APIs, delivery and the decisions behind this site.",
  alternates: { canonical: "/writing", types: { "application/rss+xml": "/feed.xml" } },
};

export default function WritingPage() {
  const posts = getPosts();
  return (
    <Section
      id="writing-list"
      eyebrow="Writing"
      title="Notes from building things"
      description="Practical write-ups with the measurement attached. New posts appear in the RSS feed."
    >
      {posts.length === 0 ? (
        <p className="rounded-xl border border-border border-dashed p-10 text-center text-muted-foreground">
          Nothing published yet. The first posts are on their way.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {posts.map((post) => (
            <li key={post.slug} className="py-6 first:pt-0">
              <article className="grid gap-2 sm:grid-cols-[10rem_1fr]">
                <p className="text-muted-foreground text-sm">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  <span className="block text-xs">{post.readingMinutes} min read</span>
                </p>
                <div>
                  <h3 className="font-semibold text-title tracking-tight">
                    <Link href={`/writing/${post.slug}`} className="hover:text-primary">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-pretty text-muted-foreground">{post.summary}</p>
                  {post.tags.length ? (
                    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">
                      {post.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-border px-2 py-0.5 text-muted-foreground text-xs"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
