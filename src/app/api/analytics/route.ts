import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalStories,
    totalViews,
    totalTags,
    totalCategories,
    topStories,
    recentStories,
    storiesCreatedToday,
    storiesCreatedWeek,
    storiesCreatedMonth,
  ] = await Promise.all([
    prisma.story.count({ where: { status: "published" } }),
    prisma.story.aggregate({ _sum: { viewCount: true }, where: { status: "published" } }),
    prisma.tag.count(),
    prisma.category.count(),
    prisma.story.findMany({
      where: { status: "published" },
      select: { id: true, title: true, slug: true, viewCount: true },
      orderBy: { viewCount: "desc" },
      take: 10,
    }),
    prisma.story.findMany({
      where: { status: "published" },
      select: { id: true, title: true, slug: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.story.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.story.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.story.count({ where: { createdAt: { gte: monthAgo } } }),
  ]);

  return NextResponse.json({
    totalStories,
    totalViews: totalViews._sum.viewCount || 0,
    totalTags,
    totalCategories,
    viewsToday: storiesCreatedToday,
    viewsWeek: storiesCreatedWeek,
    viewsMonth: storiesCreatedMonth,
    topStories,
    recentStories,
  });
}
