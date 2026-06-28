import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/public/StoryCard";
import { parseMetadata } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Все сказки — Сказки Онлайн",
  description: "Читайте бесплатно сказки для детей онлайн. Народные, авторские, по возрасту.",
};

export default async function StoriesPage() {
  const [stories, categories] = await Promise.all([
    prisma.story.findMany({
      where: { status: "published" },
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.category.findMany({
      include: { _count: { select: { storyCategories: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="flex-1 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Все сказки</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar — категории */}
          <aside className="md:w-64 shrink-0">
            <h2 className="font-bold text-gray-900 mb-3">Категории</h2>
            <nav className="space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="block px-3 py-2 rounded-lg text-sm transition-colors text-gray-600 hover:bg-gray-100"
                >
                  {cat.name}
                  <span className="text-gray-400 ml-1">({cat._count.storyCategories})</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Сетка сказок */}
          <div className="flex-1">
            {stories.length === 0 ? (
              <p className="text-gray-500 text-lg">Сказки пока не добавлены.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
        </div>
      </div>
    </main>
  );
}
