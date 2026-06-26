import Link from "next/link";
import { prisma } from "@/lib/db";

export const revalidate = 3600;

export const metadata = {
  title: "Теги — Сказки Онлайн",
};

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { usageCount: "desc" },
    take: 100,
  });

  return (
    <main className="flex-1 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Теги</h1>

        {tags.length === 0 ? (
          <p className="text-gray-500">Теги пока не добавлены.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded-full transition-colors"
              >
                {tag.name}
                <span className="text-purple-500 text-sm ml-1">({tag.usageCount})</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
