import { PrismaClient } from "./src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
    const story = await prisma.story.findUnique({
        where: { slug: "kurochka-ryaba" },
        include: { images: true },
    });

    if (!story) { console.log("Story not found!"); return; }

    console.log(`Story: ${story.title} (${story.id})`);
    console.log(`Existing images: ${story.images.length}`);

    await prisma.storyImage.deleteMany({ where: { storyId: story.id } });

    const images = [
        { paragraphIndex: 0, imageUrl: "/images/inline/kurochka-ryaba-p1.webp", altText: "Дед и баба сидят в избе, рядом курочка Ряба", caption: "Жили-были дед да баба..." },
        { paragraphIndex: 1, imageUrl: "/images/inline/kurochka-ryaba-p2.webp", altText: "Курочка несёт золотое яичко", caption: "Несла курочка яичко да не простое, а золотое" },
        { paragraphIndex: 2, imageUrl: "/images/inline/kurochka-ryaba-p3.webp", altText: "Золотое яичко разбилось", caption: "Уронила — и разбилось!" },
        { paragraphIndex: 3, imageUrl: "/images/inline/kurochka-ryaba-p4.webp", altText: "Дед и баба плачут", caption: "Плачет дед, плачет баба" },
        { paragraphIndex: 4, imageUrl: "/images/inline/kurochka-ryaba-p5.webp", altText: "Курочка утешает деда и бабу", caption: "Не плачь, дед, не плачь, баба!" },
        { paragraphIndex: 5, imageUrl: "/images/inline/kurochka-ryaba-p6.webp", altText: "Мышка разбила простое яичко", caption: "Мышка бежала, хвостиком махнула — яичко и разбилось!" },
        { paragraphIndex: 6, imageUrl: "/images/inline/kurochka-ryaba-p7.webp", altText: "Дед и баба снова плачут", caption: "Плачет дед, плачет баба" },
        { paragraphIndex: 7, imageUrl: "/images/inline/kurochka-ryaba-p8.webp", altText: "Курочка обещает яичко ещё лучше", caption: "Я снесу вам яичко ещё лучше!" },
    ];

    for (const img of images) {
        await prisma.storyImage.create({
            data: {
                storyId: story.id,
                paragraphIndex: img.paragraphIndex,
                imageUrl: img.imageUrl,
                altText: img.altText,
                caption: img.caption,
                sortOrder: img.paragraphIndex,
            },
        });
        console.log(`  Added image for paragraph ${img.paragraphIndex}`);
    }

    console.log(`\nDone! ${images.length} images added.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
