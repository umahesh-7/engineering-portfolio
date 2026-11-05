import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { getPost, getPosts } from "@/lib/content";
import { env } from "@/lib/env";
import { OG_SIZE, OgCard } from "@/lib/og";

export const alt = "Writing";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return new ImageResponse(
    <OgCard
      eyebrow="Writing"
      title={post.title}
      description={post.summary}
      footer={new URL(env.NEXT_PUBLIC_SITE_URL).host}
    />,
    size,
  );
}
