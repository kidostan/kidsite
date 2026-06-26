import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/public/StoryCard";
import { parseMetadata } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Все сказки — Сказки Онлайн",
};

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; age?: string }>;
}) {
  const params = await searchParams;
  const { q, category } = params;

  const where: Record<string, unknown> = { status: "published" };

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { storyText: { contains: q } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  const stories = await prisma.story.findMany({
    where,
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return (
    <main className="flex-1 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">
          {q ? `Результаты поиска: "${q}"` : "Все сказки"}
        </h1>

        {stories.length === 0 ? (
          <p className="text-gray-500 text-lg">Сказки пока не добавлены.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={{
                  ...story,
                  metadata: parseMetadata(story.metadata),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
