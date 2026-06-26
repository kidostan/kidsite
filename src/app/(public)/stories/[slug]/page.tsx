import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { StoryJsonLd } from "@/components/seo/StoryJsonLd";
import type { Metadata } from "next";
import Link from "next/link";
import { parseMetadata } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
  const meta = parseMetadata(story.metadata);

  return {
    title: seo?.seoTitle || `${story.title} | Сказки Онлайн`,
    description: seo?.seoDescription || `Сказка "${story.title}" для детей`,
    openGraph: {
      title: story.title,
      description: seo?.seoDescription || "",
      images: [seo?.ogImage || story.coverImageUrl || ""],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: seo?.seoDescription || "",
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/stories/${story.slug}`,
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
    },
  });

  if (!story) {
    notFound();
  }

  // Increment view count
  await prisma.story.update({
    where: { id: story.id },
    data: { viewCount: { increment: 1 } },
  });

  const meta = parseMetadata(story.metadata);

  // Parse story text into paragraphs and match images
  const paragraphs = story.storyText.split(/\n\n+/).filter((p) => p.trim());
  let imageIndex = 0;

  return (
    <>
      <StoryJsonLd story={story as unknown as Record<string, unknown>} />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-purple-600">Главная</Link>
          <span className="mx-2">/</span>
          <Link href="/stories" className="hover:text-purple-600">Сказки</Link>
          {story.category && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/categories/${story.category.slug}`} className="hover:text-purple-600">
                {story.category.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-gray-900">{story.title}</span>
        </nav>

        {/* Header */}
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
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {story.viewCount} просмотров
            </span>
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

        {/* Audio Player */}
        {story.audioUrl && (
          <div className="mb-8">
            <AudioPlayer src={story.audioUrl} title="Слушать сказку" />
          </div>
        )}

        {/* Story Content */}
        <div className="prose prose-lg max-w-none">
          {paragraphs.map((paragraph, i) => {
            const img = story.images[i] || null;
            return (
              <div key={i} className="mb-6">
                <p>{paragraph}</p>
                {img && (
                  <figure className="my-6">
                    <img
                      src={img.imageUrl}
                      alt={img.altText || `Иллюстрация ${i + 1}`}
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

        {/* Tags */}
        {story.tags.length > 0 && (
          <footer className="mt-12 pt-8 border-t">
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
          </footer>
        )}
      </article>
    </>
  );
}
