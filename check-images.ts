import { PrismaClient } from "./src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url: "file:./dev.db" }) });
async function main() {
  const story = await prisma.story.findUnique({ where: { slug: "kurochka-ryaba" }, include: { images: true } });
  console.log("Images count:", story?.images?.length);
  story?.images?.forEach((i: any) => console.log("  p" + i.paragraphIndex + ":", i.imageUrl));
  await prisma.$disconnect();
}
main();
