import { PrismaClient } from "./src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url: "file:./dev.db" }) });

async function main() {
    // Find the story by title
    const story = await prisma.story.findFirst({
        where: { title: { contains: "вены синие" } },
        select: { id: true, slug: true, title: true, status: true, categoryId: true },
    });
    console.log("Story:", story);

    // Find by partial slug
    const bySlug = await prisma.story.findFirst({
        where: { slug: { contains: "veny" } },
        select: { id: true, slug: true, title: true, status: true },
    });
    console.log("By slug:", bySlug);

    // Count all stories with status
    const counts = await prisma.story.groupBy({ by: ["status"], _count: true });
    console.log("By status:", counts);

    // Check a few slugs
    const samples = await prisma.story.findMany({
        where: { title: { startsWith: "Почему" } },
        select: { slug: true, title: true },
        take: 3,
    });
    console.log("Samples:", samples);

    await prisma.$disconnect();
}
main();
