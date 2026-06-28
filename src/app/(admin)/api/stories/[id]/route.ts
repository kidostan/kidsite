import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { generateSlug, readingTime, parseStoryParagraphs, uniqueSlug } from "@/lib/utils";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

const storyUpdateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  story_text: z.string().min(1).optional(),
  audio_url: z.string().optional().nullable(),
  cover_image_url: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      paragraphs: { orderBy: { paragraphIndex: "asc" } },
      category: true,
      tags: { include: { tag: true } },
      seoMetadata: true,
    },
  });

  if (!story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Parse metadata for SQLite (stored as JSON string)
  const parsed = {
    ...story,
    metadata: typeof story.metadata === "string" ? JSON.parse(story.metadata) : story.metadata,
    seoMetadata: story.seoMetadata
      ? {
          ...story.seoMetadata,
          keywords: typeof story.seoMetadata.keywords === "string"
            ? JSON.parse(story.seoMetadata.keywords)
            : story.seoMetadata.keywords,
        }
      : null,
  };

  return NextResponse.json(parsed);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = storyUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {};

    if (data.title) {
      updateData.title = data.title;
      updateData.slug = await uniqueSlug(generateSlug(data.title), id);
    }
    if (data.story_text) {
      updateData.storyText = data.story_text;
      updateData.readingTimeMinutes = readingTime(data.story_text);
    }
    if (data.audio_url !== undefined) updateData.audioUrl = data.audio_url;
    if (data.cover_image_url !== undefined) updateData.coverImageUrl = data.cover_image_url;
    if (data.category_id !== undefined) updateData.categoryId = data.category_id;
    if (data.status) updateData.status = data.status;
    if (data.metadata) updateData.metadata = JSON.stringify(data.metadata);

    // Update paragraphs if text changed
    if (data.story_text) {
      const paragraphs = parseStoryParagraphs(data.story_text);
      await prisma.storyParagraph.deleteMany({ where: { storyId: id } });
      await prisma.storyParagraph.createMany({
        data: paragraphs.map((p, i) => ({
          storyId: id,
          paragraphIndex: i,
          content: p.content,
          hasImage: p.hasImage,
        })),
      });
    }

    // Handle tags
    if (data.tags !== undefined) {
      const uniqueTags = [...new Set(data.tags.map((t) => t.trim()).filter(Boolean))];
      // First, remove all existing tag links
      const existingLinks = await prisma.storyTag.findMany({
        where: { storyId: id },
        select: { storyId: true, tagId: true },
      });
      for (const link of existingLinks) {
        await prisma.storyTag.delete({
          where: { storyId_tagId: { storyId: link.storyId, tagId: link.tagId } },
        });
      }
      // Now create new links
      const seenTagIds = new Set<string>();
      for (const tagName of uniqueTags) {
        const tagSlug = generateSlug(tagName);
        let tag = await prisma.tag.findFirst({ where: { name: tagName } });
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName, slug: tagSlug, usageCount: 1 },
          });
        } else {
          await prisma.tag.update({ where: { id: tag.id }, data: { usageCount: { increment: 1 } } });
        }
        if (!seenTagIds.has(tag.id)) {
          seenTagIds.add(tag.id);
          await prisma.storyTag.create({
            data: { storyId: id, tagId: tag.id },
          });
        }
      }
    }

    const story = await prisma.story.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error("PUT /api/stories error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.story.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
