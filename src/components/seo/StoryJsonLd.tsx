import { parseMetadata } from "@/lib/utils";

export function StoryJsonLd({ story }: { story: Record<string, unknown> }) {
  const meta = parseMetadata(story.metadata);
  const seo = parseMetadata(story.seoMetadata);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: seo.seoDescription || meta.seo_description,
    image: story.coverImageUrl,
    datePublished: story.createdAt,
    dateModified: story.updatedAt,
    author: {
      "@type": "Organization",
      name: "Сказки Онлайн",
    },
    publisher: {
      "@type": "Organization",
      name: "Сказки Онлайн",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_APP_URL}/stories/${story.slug}`,
    },
    articleSection: meta.category,
    wordCount: typeof story.storyText === "string" ? story.storyText.split(/\s+/).length : undefined,
    timeRequired: story.readingTimeMinutes
      ? `PT${story.readingTimeMinutes}M`
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
