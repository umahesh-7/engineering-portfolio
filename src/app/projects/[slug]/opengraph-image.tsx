import { ImageResponse } from "next/og";
import { getProject, getProjects } from "@/lib/content";
import { env } from "@/lib/env";
import { OG_SIZE, OgCard } from "@/lib/og";
import { PILLAR_LABELS } from "@/lib/pillars";

export const alt = "Case study";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  const title = project?.title ?? "Case study";
  const description = project
    ? `${project.employer} · ${project.pillars.map((p) => PILLAR_LABELS[p]).join(", ")}`
    : undefined;
  return new ImageResponse(
    <OgCard
      eyebrow="Case study"
      title={title}
      description={description}
      footer={new URL(env.NEXT_PUBLIC_SITE_URL).host}
    />,
    size,
  );
}
