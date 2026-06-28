import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSlug, readingTime } from "@/lib/utils";
import Papa from "papaparse";

export const dynamic = "force-static";

interface ImportRow {
  title: string;
  story_text?: string;
  category?: string;
  age_min?: string;
  age_max?: string;
  difficulty?: string;
  tags?: string;
  audio_url?: string;
  cover_image_url?: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const text = await file.text();
    const ext = file.name.split(".").pop()?.toLowerCase();

    let rows: ImportRow[] = [];

    if (ext === "json") {
      const parsed = JSON.parse(text);
      rows = Array.isArray(parsed) ? parsed : [parsed];
    } else if (ext === "csv") {
      const result = Papa.parse<ImportRow>(text, { header: true, skipEmptyLines: true });
      rows = result.data;
    } else {
      return NextResponse.json({ error: "Only CSV and JSON supported" }, { status: 400 });
    }

    const results = { total: rows.length, created: 0, errors: [] as string[][] };

    for (const row of rows) {
      try {
        if (!row.title || !row.story_text) {
          results.errors.push([row.title || "unknown", "Missing title or story_text"]);
          continue;
        }

        // Find or create category
        let categoryId: string | null = null;
        if (row.category) {
          const catSlug = generateSlug(row.category);
          const cat = await prisma.category.upsert({
            where: { slug: catSlug },
            update: {},
            create: { name: row.category, slug: catSlug },
          });
          categoryId = cat.id;
        }

        const slug = generateSlug(row.title);
        const meta: Record<string, unknown> = {};
        if (row.age_min) meta.age_min = parseInt(row.age_min);
        if (row.age_max) meta.age_max = parseInt(row.age_max);
        if (row.difficulty) meta.difficulty = row.difficulty;

        const story = await prisma.story.create({
          data: {
            title: row.title,
            slug,
            storyText: row.story_text,
            audioUrl: row.audio_url || null,
            coverImageUrl: row.cover_image_url || null,
            readingTimeMinutes: readingTime(row.story_text),
            status: "published",
            metadata: JSON.stringify(meta),
            categoryId,
          },
        });

        // Handle tags
        if (row.tags) {
          const tagNames = row.tags.split(",").map((t) => t.trim()).filter(Boolean);
          for (const tagName of tagNames) {
            const tagSlug = generateSlug(tagName);
            const tag = await prisma.tag.upsert({
              where: { slug: tagSlug },
              update: { usageCount: { increment: 1 } },
              create: { name: tagName, slug: tagSlug, usageCount: 1 },
            });
            await prisma.storyTag.create({
              data: { storyId: story.id, tagId: tag.id },
            });
          }
        }

        results.created++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        results.errors.push([row.title, msg]);
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Import failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
