import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const stories = await prisma.story.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { seoMetadata: true },
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml("Сказки Онлайн — Бесплатные сказки для детей")}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml("Читайте тысячи сказок для детей онлайн бесплатно")}</description>
    <language>ru</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${stories
      .map(
        (story) => `
    <item>
      <title>${escapeXml(story.title)}</title>
      <link>${baseUrl}/stories/${story.slug}</link>
      <guid isPermaLink="true">${baseUrl}/stories/${story.slug}</guid>
      <pubDate>${story.createdAt.toUTCString()}</pubDate>
      <description>${escapeXml(story.seoMetadata?.seoDescription || "")}</description>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
