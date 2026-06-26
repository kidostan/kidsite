import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/public/StoryCard";
import type { Metadata } from "next";
import { parseMetadata } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};

  return {
    title: `${category.name} — Сказки Онлайн`,
    description: category.description || `Сказки в категории "${category.name}"`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      stories: {
        where: { status: "published" },
        include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="flex-1 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 mb-6">{category.description}</p>
        )}

        {category.stories.length === 0 ? (
          <p className="text-gray-500">В этой категории пока нет сказок.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {category.stories.map((story) => (
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
