"use client";

import { useState } from "react";

export default function AdminAnalyticsPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    created: number;
    errors: string[][];
  } | null>(null);

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
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Аналитика &amp; Импорт</h1>

      {/* Import */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="font-semibold mb-4">Массовый импорт</h2>
        <p className="text-sm text-gray-600 mb-4">
          Загрузите CSV или JSON файл с сказками. Формат CSV: title, story_text, category,
          age_min, age_max, difficulty, tags, audio_url, cover_image_url
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
                  <div key={i}>
                    {title}: {err}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Статистика</h2>
        <p className="text-sm text-gray-500">
          Подключите Яндекс.Метрику для отслеживания просмотров.
          Данные о просмотрах сказок уже собираются автоматически.
        </p>
      </div>
    </div>
  );
}
