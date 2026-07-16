import Link from "next/link";
import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/public/StoryCard";
import { parseMetadata } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Сказки для детей онлайн — читать бесплатно | Сказки Онлайн",
  description: "Читайте бесплатно сказки для детей онлайн. Народные, авторские, по возрасту. Народные сказки, Пушкин, Чуковский, Андерсен и другие.",
  keywords: "сказки для детей, сказки читать онлайн, сказки для детей 3 лет, сказки для детей 5 лет, народные сказки, сказки пушкина, сказки чуковского, сказки андерсена",
  openGraph: {
    title: "Сказки для детей онлайн",
    description: "Читайте бесплатно сказки для детей любого возраста.",
    images: [`${process.env.NEXT_PUBLIC_APP_URL || ""}/og/home`],
    type: "website",
  },
};

export default async function HomePage() {
  const [newStories, popularStories, ageCategories, authorCategories, pochemuchki, pochemuchkiCategory] =
    await Promise.all([
      prisma.story.findMany({
        where: {
          status: "published",
          storyCategories: { none: { category: { slug: "pochemuchki" } } },
        },
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.story.findMany({
        where: {
          status: "published",
          storyCategories: { none: { category: { slug: "pochemuchki" } } },
        },
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: true,
        },
        orderBy: { viewCount: "desc" },
        take: 10,
      }),
      prisma.category.findMany({
        where: { slug: { in: ["do-3-let", "ot-3-do-5-let", "ot-5-do-8-let", "ot-8-do-12-let"] } },
        include: { _count: { select: { storyCategories: true } } },
        orderBy: { slug: "asc" },
      }),
      prisma.category.findMany({
        where: {
          slug: {
            in: [
              "народные-сказки",
              "сказки-ас-пушкина",
              "сказки-ки-чуковского",
              "сказки-хк-андерсена",
              "сказки-братьев-гримм",
              "сказки-шарля-перро",
              "авторские-сказки",
            ],
          },
        },
        include: { _count: { select: { storyCategories: true } } },
      }),
      prisma.story.findMany({
        where: {
          status: "published",
          storyCategories: {
            some: { category: { slug: "pochemuchki" } },
          },
        },
        include: {
          storyCategories: { include: { category: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      prisma.category.findUnique({
        where: { slug: "pochemuchki" },
        include: { _count: { select: { storyCategories: true } } },
      }),
    ]);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-100 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-purple-900">
            Сказки для детей онлайн
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Читайте бесплатно сказки для детей любого возраста.
            Народные, авторские, волшебные — более 50 сказок.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/stories"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
            >
              Читать сказки
            </Link>
            <Link
              href="/categories"
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-full font-semibold transition-colors"
            >
              Категории
            </Link>
          </div>
        </div>
      </section>

      {/* Сказки по возрасту */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Сказки по возрасту</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ageCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="block p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors text-center"
              >
                <div className="text-4xl mb-3">
                  {cat.slug === "do-3-let"
                    ? "👶"
                    : cat.slug === "ot-3-do-5-let"
                      ? "🧒"
                      : cat.slug === "ot-5-do-8-let"
                        ? "📚"
                        : "🎓"}
                </div>
                <h3 className="font-bold text-gray-900">{cat.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {cat._count.storyCategories} сказок
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Сказки по авторам */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Сказки по авторам</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {authorCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="block p-4 rounded-xl bg-white hover:bg-purple-50 transition-colors text-center border border-gray-100"
              >
                <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {cat._count.storyCategories} сказок
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Новые сказки */}
      {newStories.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Новые сказки</h2>
              <Link href="/stories" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Все сказки →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {newStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={{
                    ...story,
                    metadata: parseMetadata(story.metadata),
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Популярные сказки */}
      {popularStories.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Популярные сказки</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {popularStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={{
                    ...story,
                    metadata: parseMetadata(story.metadata),
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Сказки-почемучки */}
      {pochemuchki.length > 0 && (
        <section className="py-12 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">❓</span>
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">Сказки-почемучки</h2>
                  <p className="text-sm text-amber-700">
                    {pochemuchkiCategory?._count.storyCategories || pochemuchki.length} познавательных сказок для любопытных
                  </p>
                </div>
              </div>
              <Link
                href="/pochemuchki"
                className="text-amber-700 hover:text-amber-900 text-sm font-medium"
              >
                Все почему →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pochemuchki.map((story) => {
                const meta = parseMetadata(story.metadata);
                const question = (meta as any)?.question || story.title;
                return (
                  <Link
                    key={story.id}
                    href={`/pochemuchki/${story.slug}`}
                    className="group block bg-white rounded-xl p-4 hover:shadow-md transition-shadow border border-amber-100"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0 mt-0.5">💡</span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-amber-700 transition-colors">
                          {story.title}
                        </h3>
                        <p className="text-xs text-amber-600 mt-1 line-clamp-1">
                          {question}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SEO текст */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">Сказки для детей читать онлайн</h2>
          <div className="prose prose-gray max-w-none">
            <p>
              Добро пожаловать на сайт сказок для детей! Здесь вы найдёте любимые
              сказки для чтения вслух: русские народные, сказки Пушкина, Чуковского,
              Андерсена, братьев Гримм и других авторов.
            </p>
            <p>
              Все сказки разделены по возрасту и тематике. Для самых маленьких —
              короткие и простые сказки. Для детей постарше — более длинные и
              сложные истории. Каждая сказка содержит поучительный урок.
            </p>
            <p>
              Читайте сказки детям перед сном, во время прогулки или в дороге.
              Сайт адаптирован для мобильных устройств, поэтому удобно читать
              с любого телефона или планшета.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
