import Link from "next/link";

interface StoryCardProps {
  story: {
    id: string;
    title: string;
    slug: string;
    coverImageUrl?: string | null;
    readingTimeMinutes?: number | null;
    viewCount: number;
    metadata: Record<string, unknown>;
    category?: { name: string; slug: string } | null;
    images?: { imageUrl: string }[];
  };
}

export function StoryCard({ story }: StoryCardProps) {
  const meta = story.metadata as { age_min?: number; age_max?: number; difficulty?: string };
  const coverImage = story.coverImageUrl || story.images?.[0]?.imageUrl;

  return (
    <Link href={`/stories/${story.slug}`} className="group block">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={story.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <span className="text-6xl">📖</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-white font-bold text-lg line-clamp-2">{story.title}</h3>
          <div className="flex gap-2 mt-2 flex-wrap">
            {meta.age_min && meta.age_max && (
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                {meta.age_min}–{meta.age_max} лет
              </span>
            )}
            {story.readingTimeMinutes && (
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                {story.readingTimeMinutes} мин
              </span>
            )}
            {story.category && (
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                {story.category.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <h3 className="mt-2 font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
        {story.title}
      </h3>
    </Link>
  );
}
