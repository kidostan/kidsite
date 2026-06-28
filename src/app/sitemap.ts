import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const [stories, categories, tags] = await Promise.all([
    prisma.story.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({
      select: { slug: true },
    }),
    prisma.tag.findMany({
      select: { slug: true },
    }),
  ]);

  const storyUrls = stories.map((story) => ({
    url: `${baseUrl}/stories/${story.slug}`,
    lastModified: story.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const tagUrls = tags.map((tag) => ({
    url: `${baseUrl}/tags/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/stories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...categoryUrls,
    ...tagUrls,
    ...storyUrls,
  ];
}
