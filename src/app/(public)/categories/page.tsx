import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Категории — Сказки Онлайн",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { stories: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="flex-1 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Категории</h1>

        {categories.length === 0 ? (
          <p className="text-gray-500">Категории пока не добавлены.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="block p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-lg">{cat.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {cat._count.stories} {cat._count.stories === 1 ? "сказка" : "сказок"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
