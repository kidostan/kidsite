import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const where: Record<string, unknown> = {};

  if (params.status) {
    where.status = params.status;
  }

  const stories = await prisma.story.findMany({
    where,
    include: {
      category: true,
      _count: { select: { images: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Сказки ({stories.length})</h1>
        <div className="flex gap-3">
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
            Импорт
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <Link
          href="/admin/stories"
          className={`px-3 py-1 rounded-full text-sm ${!params.status ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Все
        </Link>
        <Link
          href="/admin/stories?status=published"
          className={`px-3 py-1 rounded-full text-sm ${params.status === "published" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Опубликованные
        </Link>
        <Link
          href="/admin/stories?status=draft"
          className={`px-3 py-1 rounded-full text-sm ${params.status === "draft" ? "bg-yellow-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Черновики
        </Link>
      </div>

      {/* Stories Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Название</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Категория</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Статус</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Views</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stories.map((story) => (
              <tr key={story.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/admin/stories/${story.id}/edit`} className="font-medium hover:text-purple-600">
                    {story.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {story.category?.name || "—"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      story.status === "published"
                        ? "bg-green-100 text-green-700"
                        : story.status === "archived"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {story.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{story.viewCount}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/stories/${story.id}/edit`}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Редактировать
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stories.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            Нет сказок.{" "}
            <Link href="/admin/stories/new" className="text-purple-600 hover:underline">
              Создать
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
