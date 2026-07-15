import { PrismaClient } from "./src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url: "file:./dev.db" }) });

async function main() {
    const category = await prisma.category.findUnique({ where: { slug: "pochemuchki" } });
    if (!category) { console.log("Category not found!"); return; }

    // Get all story IDs linked via StoryCategory
    const links = await prisma.storyCategory.findMany({
        where: { categoryId: category.id },
        select: { storyId: true },
    });
    const storyIds = links.map((l: any) => l.storyId);
    console.log(`Found ${storyIds.length} stories in pochemuchki category`);

    // Update direct categoryId
    const result = await prisma.story.updateMany({
        where: { id: { in: storyIds } },
        data: { categoryId: category.id },
    });
    console.log(`Updated ${result.count} stories with categoryId`);

    await prisma.$disconnect();
}
main();
