import { PrismaClient } from "./src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url: "file:./dev.db" }) });

async function main() {
    // Check a pourquoi story by title
    const story = await prisma.story.findFirst({
        where: { title: { contains: "небо" } },
        include: { storyCategories: { include: { category: true } } },
    });
    console.log("Story:", story ? { id: story.id, slug: story.slug, title: story.title } : "NOT FOUND");

    // Check total stories
    const total = await prisma.story.count();
    console.log("Total stories:", total);

    // Check a few slugs
    const samples = await prisma.story.findMany({
        where: { slug: { contains: "почему" } },
        select: { slug: true, title: true },
        take: 5,
    });
    console.log("Samples:", samples);

    // Check by title containing "почему"
    const pochemu = await prisma.story.findMany({
        where: { title: { startsWith: "Почему" } },
        select: { slug: true, title: true },
        take: 5,
    });
    console.log("Pochemu stories:", pochemu);

    await prisma.$disconnect();
}
main();
