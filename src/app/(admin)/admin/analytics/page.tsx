"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalStories: number;
  totalViews: number;
  totalTags: number;
  totalCategories: number;
  viewsToday: number;
  viewsWeek: number;
  viewsMonth: number;
  topStories: { title: string; slug: string; viewCount: number; id: string }[];
  recentStories: { title: string; slug: string; createdAt: string; id: string }[];
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    created: number;
    errors: string[][];
  } | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/import", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      setResult(data);
    }
    setImporting(false);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Аналитика</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Всего сказок</div>
            <div className="text-2xl font-bold">{stats.totalStories}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Всего просмотров</div>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Категорий</div>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-500">Тегов</div>
            <div className="text-2xl font-bold">{stats.totalTags}</div>
          </div>
        </div>
      )}

      {/* Views breakdown */}
      {stats && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="font-semibold mb-4">Просмотры</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.totalViews}</div>
              <div className="text-sm text-gray-500">Всего просмотров</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.viewsToday}</div>
              <div className="text-sm text-gray-500">Новых за сегодня</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.viewsWeek}</div>
              <div className="text-sm text-gray-500">Новых за неделю</div>
            </div>
          </div>
        </div>
      )}

      {/* Top stories */}
      {stats && stats.topStories.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="font-semibold mb-4">Популярные сказки</h2>
          <div className="space-y-3">
            {stats.topStories.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-6">{i + 1}.</span>
                  <a href={`/stories/${s.slug}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                    {s.title}
                  </a>
                </div>
                <span className="text-sm text-gray-500">{s.viewCount} просм.</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent stories */}
      {stats && stats.recentStories.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="font-semibold mb-4">Последние добавленные</h2>
          <div className="space-y-2">
            {stats.recentStories.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <a href={`/admin/stories/${s.id}/edit`} className="text-purple-600 hover:text-purple-700">
                  {s.title}
                </a>
                <span className="text-sm text-gray-400">
                  {new Date(s.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Import */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="font-semibold mb-4">Массовый импорт</h2>
        <p className="text-sm text-gray-600 mb-4">
          Загрузите CSV или JSON файл с сказками.
        </p>

        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleImport}
            disabled={importing}
            className="text-sm"
          />
          {importing && (
            <span className="text-sm text-gray-500">Импорт...</span>
          )}
        </div>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm">
              Всего: <strong>{result.total}</strong> | Создано:{" "}
              <strong className="text-green-600">{result.created}</strong> | Ошибки:{" "}
              <strong className="text-red-600">{result.errors.length}</strong>
            </p>
            {result.errors.length > 0 && (
              <div className="mt-2 text-sm text-red-600">
                {result.errors.map(([title, err], i) => (
                  <div key={i}>{title}: {err}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
