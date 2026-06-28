import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/public/StoryCard";
import type { Metadata } from "next";
import { parseMetadata } from "@/lib/utils";

export async function generateStaticParams() {
  const tags = await prisma.tag.findMany({
    select: { slug: true },
  });
  return tags.map((t) => ({ slug: t.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const tag = await prisma.tag.findUnique({ where: { slug: decodedSlug } });
  if (!tag) return {};

  return {
    title: `${tag.name} — Сказки Онлайн`,
    description: `Сказки с тегом "${tag.name}"`,
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const tag = await prisma.tag.findUnique({
    where: { slug: decodedSlug },
    include: {
      stories: {
        include: {
          story: {
            include: {
              images: { take: 1, orderBy: { sortOrder: "asc" } },
              category: true,
            },
          },
        },
      },
    },
  });

  if (!tag) {
    notFound();
  }

  return (
    <main className="flex-1 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">
          Тег: {tag.name}
          <span className="text-gray-400 text-lg ml-2">({tag.usageCount})</span>
        </h1>

        {tag.stories.length === 0 ? (
          <p className="text-gray-500">Сказок с этим тегом пока нет.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {tag.stories.map((st) => (
              <StoryCard
                key={st.story.id}
                story={{
                  ...st.story,
                  metadata: parseMetadata(st.story.metadata),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
