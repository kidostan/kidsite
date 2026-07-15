import Link from "next/link";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Сказки-почемучки — познавательные сказки для детей | Сказки Онлайн",
  description: "Почему небо синее? Почему дождь идёт? 230+ познавательных сказок-почемучек для любопытных детей. Читайте бесплатно онлайн.",
};

export default async function PochemuchkiPage() {
  const category = await prisma.category.findUnique({
    where: { slug: "pochemuchki" },
    include: { _count: { select: { storyCategories: true } } },
  });

  const storyCategories = await prisma.storyCategory.findMany({
    where: { category: { slug: "pochemuchki" } },
    include: { story: true },
    orderBy: { story: { createdAt: "desc" } },
  });

  const stories = storyCategories
    .map((sc) => sc.story)
    .filter((s) => s.status === "published");

  // Group by topic
  const nature = stories.filter((s) =>
    ["небо", "дождь", "снег", "солнце", "луна", "вода", "ветер", "облака", "снег", "лёд", "радуга", "туман", "гроза", "молния", "гром", "рассвет", "закат", "звёзды", "комета"].some(w => s.title.toLowerCase().includes(w))
  );
  const body = stories.filter((s) =>
    ["глаз", "нос", "ухо", "рот", "волос", "ногт", "кост", "сустав", "сердц", "кров", "мозг", "пупок", "чих", "кашл", "сон", "сон", "растём", "пoteем", "зев"].some(w => s.title.toLowerCase().includes(w))
  );
  const animals = stories.filter((s) =>
    ["кот", "собак", "пчел", "кури", "петух", "ворон", "синиц", "волк", "медвед", "заяц", "лис", "еж", "жираф", "слон", "мыш", "комар", "бабоч", "жук", "лягуш", "рыб", "дельфин", "акул", "пингвин", "лев", "тигр", "зебр", "панд", "лось", "олен", "коро", "лошад", "свин", "козл", "баран", "кролик", "утк", "гус", "лебед", "страус", "попуга", "сов", "кукуш", "ласточк"].some(w => s.title.toLowerCase().includes(w))
  );
  const space = stories.filter((s) =>
    ["марс", "веннер", "мёркурий", "юпитер", "сатурн", "нептун", "уран", "плутон", "лун", "космос", "звёзд", "астонафт", "ракет", "спутник", "телескоп", "астероид", "метеор", "комет", "сияни", "атмосфер", "гравитац", "озон"].some(w => s.title.toLowerCase().includes(w))
  );
  const food = stories.filter((s) =>
    ["хлеб", "яблок", "банан", "арбуз", "лимон", "мёд", "перец", "лук", "молоко", "масло", "яйц", "спагетти", "рис", "картош", "суп", "чай", "кофе", "газиров", "морожен", "шоколад", "карамел", "сахар", "сыр", "творог", "сметан", "варень", "компот", "сок", "квас", "пиво", "вино", "кефир", "йогурт"].some(w => s.title.toLowerCase().includes(w))
  );
  const other = stories.filter((s) => !nature.includes(s) && !body.includes(s) && !animals.includes(s) && !space.includes(s) && !food.includes(s));

  const sections = [
    { title: "Природа и погода", icon: "🌍", stories: nature },
    { title: "Человек и тело", icon: "🧒", stories: body },
    { title: "Животные", icon: "🐾", stories: animals },
    { title: "Космос", icon: "🚀", stories: space },
    { title: "Еда и напитки", icon: "🍽️", stories: food },
    { title: "Всё остальное", icon: "📚", stories: other },
  ].filter((s) => s.stories.length > 0);

  return (
    <main className="flex-1 py-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen">
      <div className="container mx-auto px-4">
        <nav className="text-sm text-amber-700 mb-4">
          <Link href="/" className="hover:text-amber-900">Главная</Link>
          <span className="mx-2">/</span>
          <span className="text-amber-900">Почемучки</span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-5xl">❓</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-amber-900">Сказки-почемучки</h1>
              <p className="text-amber-700 mt-1">
                {category?._count.storyCategories || stories.length} познавательных сказок для любопытных детей
              </p>
            </div>
          </div>
          <p className="text-amber-800 bg-white/60 rounded-xl p-4 mt-4">
            Почему небо синее? Почему дождь идёт? Как работает сердце? На все вопросы есть сказочный ответ!
          </p>
        </header>

        {sections.map((section) => (
          <section key={section.title} className="mb-10">
            <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">{section.icon}</span>
              {section.title}
              <span className="text-sm font-normal text-amber-600">({section.stories.length})</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {section.stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/pochemuchki/${story.slug}`}
                  className="group block bg-white rounded-xl p-4 hover:shadow-md transition-shadow border border-amber-100"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg shrink-0">💡</span>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-amber-700 transition-colors">
                      {story.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
