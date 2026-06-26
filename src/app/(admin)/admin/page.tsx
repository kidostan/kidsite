import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalStories, publishedStories, draftStories, totalCategories, totalTags, totalViews] =
    await Promise.all([
      prisma.story.count(),
      prisma.story.count({ where: { status: "published" } }),
      prisma.story.count({ where: { status: "draft" } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.story.aggregate({ _sum: { viewCount: true } }),
    ]);

  const recentStories = await prisma.story.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      viewCount: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Дашборд</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Всего сказок" value={totalStories} />
        <StatCard label="Опубликовано" value={publishedStories} />
        <StatCard label="Черновики" value={draftStories} />
        <StatCard label="Категории" value={totalCategories} />
        <StatCard label="Теги" value={totalTags} />
        <StatCard label="Просмотры" value={totalViews._sum.viewCount || 0} />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <Link
          href="/admin/stories/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Новая сказка
        </Link>
        <Link
          href="/admin/analytics"
          className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium"
        >
          Аналитика
        </Link>
      </div>

      {/* Recent Stories */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold">Последние сказки</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentStories.length === 0 ? (
            <div className="px-6 py-8 text-gray-500 text-center">
              Пока нет сказок.{" "}
              <Link href="/admin/stories/new" className="text-purple-600 hover:underline">
                Создать первую
              </Link>
            </div>
          ) : (
            recentStories.map((s) => (
              <div key={s.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <Link
                    href={`/admin/stories/${s.id}/edit`}
                    className="font-medium hover:text-purple-600"
                  >
                    {s.title}
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{s.viewCount} views</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      s.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}
