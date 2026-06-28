import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import type { Metadata } from "next";
import Link from "next/link";
import { parseMetadata } from "@/lib/utils";
import { StoryJsonLd } from "@/components/seo/StoryJsonLd";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const stories = await prisma.story.findMany({
    where: { status: "published" },
    select: { slug: true },
  });
  return stories.map((s) => ({ slug: s.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await prisma.story.findUnique({
    where: { slug },
    include: { seoMetadata: true },
  });

  if (!story) return {};

  const seo = story.seoMetadata;

  return {
    title: seo?.seoTitle || `${story.title} | Сказки Онлайн`,
    description: seo?.seoDescription || `Сказка "${story.title}" для детей`,
    keywords: seo?.keywords ? JSON.parse(seo.keywords) : undefined,
    openGraph: {
      title: story.title,
      description: seo?.seoDescription || "",
      images: [`${process.env.NEXT_PUBLIC_APP_URL || ""}/og/${story.slug}`],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: seo?.seoDescription || "",
      images: [`${process.env.NEXT_PUBLIC_APP_URL || ""}/og/${story.slug}`],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || ""}/stories/${story.slug}`,
    },
  };
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;

  const story = await prisma.story.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { paragraphIndex: "asc" } },
      paragraphs: { orderBy: { paragraphIndex: "asc" } },
      category: true,
      tags: { include: { tag: true } },
      seoMetadata: true,
      storyCategories: { include: { category: true } },
    },
  });

  if (!story) {
    notFound();
  }

  const meta = parseMetadata(story.metadata);

  const categoryIds = story.storyCategories.map((sc) => sc.categoryId);
  const similarStories =
    categoryIds.length > 0
      ? await prisma.storyCategory.findMany({
          where: {
            categoryId: { in: categoryIds },
            storyId: { not: story.id },
          },
          include: {
            story: {
              include: {
                images: { take: 1, orderBy: { sortOrder: "asc" } },
                category: true,
              },
            },
          },
          take: 10,
          distinct: ["storyId"],
        })
      : [];

  const similar = similarStories
    .map((sc) => sc.story)
    .filter((s) => s.status === "published")
    .slice(0, 5);

  const paragraphs = story.storyText.split(/\n\n+/).filter((p) => p.trim());

  const breadcrumbItems = [
    { name: "Главная", url: "/" },
    { name: "Сказки", url: "/stories" },
  ];
  if (story.category) {
    breadcrumbItems.push({
      name: story.category.name,
      url: `/categories/${story.category.slug}`,
    });
  }
  breadcrumbItems.push({ name: story.title, url: `/stories/${story.slug}` });

  return (
    <>
      <StoryJsonLd story={story as unknown as Record<string, unknown>} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbItems.map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: item.name,
              item: `${process.env.NEXT_PUBLIC_APP_URL || ""}${item.url}`,
            })),
          }),
        }}
      />

      <article className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-purple-600">Главная</Link>
            </li>
            <li><span className="mx-2">/</span></li>
            <li>
              <Link href="/stories" className="hover:text-purple-600">Сказки</Link>
            </li>
            {story.category && (
              <>
                <li><span className="mx-2">/</span></li>
                <li>
                  <Link href={`/categories/${story.category.slug}`} className="hover:text-purple-600">
                    {story.category.name}
                  </Link>
                </li>
              </>
            )}
            <li><span className="mx-2">/</span></li>
            <li className="text-gray-900">{story.title}</li>
          </ol>
        </nav>

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{story.title}</h1>
          <div className="flex gap-4 mt-4 text-gray-600 flex-wrap">
            {story.readingTimeMinutes && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {story.readingTimeMinutes} мин чтения
              </span>
            )}
            {Number(meta.age_min) > 0 && Number(meta.age_max) > 0 && (
              <span className="bg-purple-100 text-purple-700 px-3 py-0.5 rounded-full text-sm">
                {String(meta.age_min)}–{String(meta.age_max)} лет
              </span>
            )}
            {typeof meta.difficulty === "string" && (
              <span className="bg-gray-100 text-gray-700 px-3 py-0.5 rounded-full text-sm">
                {meta.difficulty}
              </span>
            )}
          </div>
        </header>

        {story.audioUrl && (
          <div className="mb-8">
            <AudioPlayer src={story.audioUrl} title="Слушать сказку" />
          </div>
        )}

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
                      alt={img.altText || `Иллюстрация к сказке ${story.title} — часть ${i + 1}`}
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

        {story.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-lg font-bold mb-3">Теги</h2>
            <div className="flex flex-wrap gap-2">
              {story.tags.map((st) => (
                <Link
                  key={st.tagId}
                  href={`/tags/${st.tag.slug}`}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm transition-colors"
                >
                  {st.tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {similar.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6">Похожие сказки</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {similar.map((s) => (
                <Link
                  key={s.id}
                  href={`/stories/${s.slug}`}
                  className="group block"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                    {s.coverImageUrl || s.images?.[0]?.imageUrl ? (
                      <img
                        src={s.coverImageUrl || s.images?.[0]?.imageUrl}
                        alt={s.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <span className="text-4xl">📖</span>
                      </div>
                    )}
                  </div>
                  <h3 className="mt-2 font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {s.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
