import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import { parseMetadata } from "@/lib/utils";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const stories = await prisma.story.findMany({
    where: {
      status: "published",
      storyCategories: { some: { category: { slug: "pochemuchki" } } },
    },
    select: { slug: true },
  });
  return stories.map((s) => ({ slug: s.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const story = await prisma.story.findUnique({
    where: { slug: decoded },
    include: { seoMetadata: true },
  });

  if (!story) return {};

  const seo = story.seoMetadata;

  return {
    title: seo?.seoTitle || `${story.title} — Почемуучка | Сказки Онлайн`,
    description: seo?.seoDescription || `Познавательная сказка "${story.title}" для детей`,
    openGraph: {
      title: story.title,
      description: seo?.seoDescription || "",
      type: "article",
    },
  };
}

export default async function PochemuchkaPage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const story = await prisma.story.findUnique({
    where: { slug: decoded },
    include: {
      images: { orderBy: { paragraphIndex: "asc" } },
      paragraphs: { orderBy: { paragraphIndex: "asc" } },
      storyCategories: { include: { category: true } },
    },
  });

  if (!story) {
    notFound();
  }

  const meta = parseMetadata(story.metadata);
  const question = (meta as Record<string, unknown>)?.question as string | undefined;
  const paragraphs = story.storyText.split(/\n\n+/).filter((p) => p.trim());

  // Find similar pochemuchki
  const categoryIds = story.storyCategories.map((sc) => sc.categoryId);
  const similar =
    categoryIds.length > 0
      ? (
          await prisma.storyCategory.findMany({
            where: {
              categoryId: { in: categoryIds },
              storyId: { not: story.id },
            },
            include: { story: true },
            take: 10,
            distinct: ["storyId"],
          })
        )
          .map((sc) => sc.story)
          .filter((s) => s.status === "published")
          .slice(0, 6)
      : [];

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/" className="hover:text-amber-700">Главная</Link></li>
          <li><span className="mx-2">/</span></li>
          <li><Link href="/categories/pochemuchki" className="hover:text-amber-700">Почемучки</Link></li>
          <li><span className="mx-2">/</span></li>
          <li className="text-gray-900">{story.title}</li>
        </ol>
      </nav>

      <header className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8">
        <div className="flex items-start gap-4">
          <span className="text-5xl shrink-0">❓</span>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-amber-900">{story.title}</h1>
            {question && (
              <p className="mt-2 text-lg text-amber-700 italic">{question}</p>
            )}
            <div className="flex gap-4 mt-3 text-sm text-amber-600 flex-wrap">
              {story.readingTimeMinutes && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {story.readingTimeMinutes} мин чтения
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="prose prose-lg max-w-none">
        {paragraphs.map((paragraph, i) => {
          const img = story.images[i] || null;
          return (
            <div key={i} className="mb-6">
              <p className="whitespace-pre-line">{paragraph}</p>
              {img && (
                <figure className="my-6">
                  <img
                    src={img.imageUrl}
                    alt={img.altText || `Иллюстрация: ${story.title}`}
                    className="rounded-lg w-full"
                    loading="lazy"
                    width={800}
                    height={600}
                  />
                  {img.caption && (
                    <figcaption className="text-center text-gray-500 mt-2 text-sm">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              )}
            </div>
          );
        })}
      </div>

      {similar.length > 0 && (
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6 text-amber-900">Ещё почемуучки</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {similar.map((s) => (
              <Link
                key={s.id}
                href={`/pochemuchki/${s.slug}`}
                className="group block bg-amber-50 rounded-xl p-4 hover:bg-amber-100 transition-colors"
              >
                <span className="text-2xl">💡</span>
                <h3 className="mt-2 font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-amber-700 transition-colors">
                  {s.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
