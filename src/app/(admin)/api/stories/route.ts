import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { generateSlug, readingTime, parseStoryParagraphs, uniqueSlug } from "@/lib/utils";

const storySchema = z.object({
  title: z.string().min(1).max(500),
  story_text: z.string().min(1),
  audio_url: z.string().optional().nullable(),
  cover_image_url: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  metadata: z.record(z.string(), z.unknown()).default({}),
  tags: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = storySchema.parse(body);

    const slug = await uniqueSlug(generateSlug(data.title));
    const readingTimeMinutes = readingTime(data.story_text);
    const paragraphs = parseStoryParagraphs(data.story_text);

    const story = await prisma.story.create({
      data: {
        title: data.title,
        slug,
        storyText: data.story_text,
        audioUrl: data.audio_url,
        coverImageUrl: data.cover_image_url,
        readingTimeMinutes,
        status: data.status,
        metadata: JSON.stringify(data.metadata),
        categoryId: data.category_id,
        paragraphs: {
          create: paragraphs.map((p, i) => ({
            paragraphIndex: i,
            content: p.content,
            hasImage: p.hasImage,
          })),
        },
      },
      include: { paragraphs: true },
    });

    // Handle tags
    if (data.tags.length > 0) {
      for (const tagName of data.tags) {
        const tagSlug = generateSlug(tagName);
        let tag = await prisma.tag.findFirst({ where: { name: tagName } });
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName, slug: tagSlug, usageCount: 1 },
          });
        } else {
          await prisma.tag.update({ where: { id: tag.id }, data: { usageCount: { increment: 1 } } });
        }
        await prisma.storyTag.create({
          data: { storyId: story.id, tagId: tag.id },
        });
      }
    }

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
