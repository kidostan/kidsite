import { PrismaClient } from "./src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url: "file:./dev.db" }) });
const DIR = "Z:/KIDSITE/skazki-pochemu";

function parseMarkdown(content: string) {
    const titleMatch = content.match(/Название:\s*(.+)/);
    const questionMatch = content.match(/Познавательный вопрос:\s*\[?(.+?)\]?/);
    const storyMatch = content.match(/Сказка:\s*\n\n([\s\S]+?)(?=\n\nЧто произошло)/);
    const explanationMatch = content.match(/Что произошло на самом деле:\s*\n([\s\S]+?)(?=\n\nВопросы)/);

    if (!titleMatch || !storyMatch) return null;

    const title = titleMatch[1].trim();
    const question = questionMatch ? questionMatch[1].trim() : "";
    const storyText = storyMatch[1].trim().replace(/\n\n+/g, "\n\n");
    const explanation = explanationMatch ? explanationMatch[1].trim() : "";

    const fullText = storyText + (explanation ? "\n\n" + explanation : "");

    return { title, question, fullText, storyText, explanation };
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^а-яёa-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

async function main() {
    let category = await prisma.category.findFirst({ where: { slug: "pochemuchki" } });
    if (!category) {
        category = await prisma.category.create({
            data: {
                name: "Сказки-почемучки",
                slug: "pochemuchki",
                description: "Познавательные сказки для любопытных детей.",
            },
        });
        console.log("Created category: Сказки-почемучки");
    }

    const files = (await readdir(DIR)).filter(f => f.endsWith(".md")).sort();
    console.log(`Found ${files.length} files`);

    let created = 0;
    let skipped = 0;

    for (const file of files) {
        const content = await readFile(join(DIR, file), "utf-8");
        const parsed = parseMarkdown(content);
        if (!parsed) { skipped++; continue; }

        const slug = slugify(parsed.title);
        if (!slug) { skipped++; continue; }

        const existing = await prisma.story.findUnique({ where: { slug } });
        if (existing) { skipped++; continue; }

        const readingTime = Math.max(1, Math.ceil(parsed.storyText.split(/\s+/).length / 150));

        try {
            const story = await prisma.story.create({
                data: {
                    title: parsed.title,
                    slug,
                    storyText: parsed.fullText,
                    coverImageUrl: null,
                    status: "published",
                    readingTimeMinutes: readingTime,
                    metadata: JSON.stringify({ question: parsed.question }),
                    paragraphs: {
                        create: parsed.fullText.split(/\n\n+/).filter((p: string) => p.trim()).map((content: string, i: number) => ({
                            paragraphIndex: i,
                            content: content.trim(),
                            hasImage: false,
                        })),
                    },
                },
            });

            await prisma.storyCategory.create({
                data: { storyId: story.id, categoryId: category.id },
            });

            created++;
            if (created % 50 === 0) console.log(`  Progress: ${created}/${files.length}`);
        } catch (e: any) {
            console.log(`  ERROR ${slug}: ${e.message?.substring(0, 80)}`);
            skipped++;
        }
    }

    console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
