import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { resolve } from "path";

const adapter = new PrismaLibSql({ url: "file:" + resolve("dev.db") });
const p = new PrismaClient({ adapter });

async function main() {
  const stories = await p.story.findMany({ select: { slug: true, title: true } });
  console.log("Total stories:", stories.length);
  
  const cyrillic = stories.filter(s => /[а-яА-ЯёЁ]/.test(s.slug));
  console.log("Stories with Cyrillic slugs:", cyrillic.length);
  if (cyrillic.length > 0) console.log(JSON.stringify(cyrillic.slice(0, 5), null, 2));

  const pochemu = stories.filter(s => s.slug.includes("pochemu") || s.title.toLowerCase().includes("почему"));
  console.log("Pochemu stories:", pochemu.length);
  if (pochemu.length > 0) console.log(JSON.stringify(pochemu.slice(0, 3), null, 2));
}

main().finally(() => p.$disconnect());
