import { PrismaClient } from './src/generated/prisma/index.js';
const p = new PrismaClient();
const s = await p.story.findMany({
  where: { storyCategories: { some: { category: { slug: 'pochemuchki' } } } },
  select: { title: true, slug: true, coverImageUrl: true },
  orderBy: { slug: 'asc' }
});
console.log('Total:', s.length);
const withCover = s.filter(x => x.coverImageUrl);
const noCover = s.filter(x => !x.coverImageUrl);
console.log('With cover:', withCover.length);
console.log('Without cover:', noCover.length);
console.log('---NO COVER---');
noCover.forEach(x => console.log(x.slug));
await p.$disconnect();
