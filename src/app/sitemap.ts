import type { MetadataRoute } from "next";
import { getPosts, getProjects } from "@/lib/content";
import { BUILD_DATE } from "@/lib/dates";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const now = BUILD_DATE;
  const statics: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/writing`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/api/docs`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
  const projects: MetadataRoute.Sitemap = getProjects().map((project) => ({
    url: `${base}/projects/${project.slug}`,
    lastModified: new Date(project.updatedAt ?? project.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  const posts: MetadataRoute.Sitemap = getPosts().map((post) => ({
    url: `${base}/writing/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...statics, ...projects, ...posts];
}
