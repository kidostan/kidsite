import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/public/StoryCard";
import type { Metadata } from "next";
import { parseMetadata } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  return categories.map((c) => ({ slug: c.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const category = await prisma.category.findUnique({ where: { slug: decodedSlug } });
  if (!category) return {};

  return {
    title: `${category.name} — Сказки Онлайн`,
    description: category.description || `Сказки в категории "${category.name}"`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const category = await prisma.category.findUnique({
    where: { slug: decodedSlug },
  });

  if (!category) {
    notFound();
  }

  const storyCategories = await prisma.storyCategory.findMany({
    where: { categoryId: category.id },
    include: {
      story: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: true,
        },
      },
    },
  });

  const stories = storyCategories
    .map((sc) => sc.story)
    .filter((s) => s.status === "published");

  return (
    <main className="flex-1 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-purple-600">Главная</a>
          <span className="mx-2">/</span>
          <a href="/categories" className="hover:text-purple-600">Категории</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{category.name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 mb-6">{category.description}</p>
        )}

        {stories.length === 0 ? (
          <p className="text-gray-500">В этой категории пока нет сказок.</p>
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
