"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

export default function NewStoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    story_text: "",
    category_id: "",
    status: "draft",
    age_min: "3",
    age_max: "7",
    difficulty: "Легкая",
    tags: "",
    audio_url: "",
    cover_image_url: "",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const metadata = {
      age_min: parseInt(form.age_min),
      age_max: parseInt(form.age_max),
      difficulty: form.difficulty,
    };

    const res = await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        story_text: form.story_text,
        category_id: form.category_id || null,
        status: form.status,
        metadata,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        audio_url: form.audio_url || null,
        cover_image_url: form.cover_image_url || null,
      }),
    });

    if (res.ok) {
      const story = await res.json();
      router.push(`/admin/stories/${story.id}/edit`);
    } else {
      setError("Ошибка сохранения");
    }
    setSaving(false);
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Новая сказка</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            placeholder="Сказка про..."
            required
          />
        </div>

        {/* Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Текст сказки <span className="text-gray-400">(Markdown)</span>
          </label>
          <textarea
            value={form.story_text}
            onChange={(e) => update("story_text", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-purple-500"
            rows={20}
            placeholder="Жили-были..."
            required
          />
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <select
              value={form.category_id}
              onChange={(e) => update("category_id", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="">Без категории</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Возраст от</label>
            <select
              value={form.age_min}
              onChange={(e) => update("age_min", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Возраст до</label>
            <select
              value={form.age_max}
              onChange={(e) => update("age_max", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              {[4, 5, 6, 7, 8, 9, 10, 12].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Сложность</label>
            <select
              value={form.difficulty}
              onChange={(e) => update("difficulty", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option>Легкая</option>
              <option>Средняя</option>
              <option>Сложная</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Теги <span className="text-gray-400">(через запятую)</span>
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            placeholder="дружба, лес, животные"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Обложка</label>
          {form.cover_image_url ? (
            <div className="space-y-2">
              <img
                src={form.cover_image_url}
                alt="Обложка"
                className="h-40 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, cover_image_url: "" }))}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Удалить
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setCoverFile(file);
                  if (file) {
                    setCoverUploading(true);
                    setError("");
                    const fd = new FormData();
                    fd.append("files", file);
                    fetch("/api/upload/images", { method: "POST", body: fd })
                      .then((r) => r.json())
                      .then((data) => {
                        if (data.files?.[0]) {
                          setForm((prev) => ({ ...prev, cover_image_url: data.files[0].url }));
                          setCoverFile(null);
                        } else {
                          setError(data.error || "Ошибка загрузки обложки");
                        }
                      })
                      .catch(() => setError("Ошибка сети"))
                      .finally(() => setCoverUploading(false));
                  }
                }}
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="w-full bg-gray-100 hover:bg-gray-200 px-4 py-8 rounded-lg text-sm disabled:opacity-50 border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors"
              >
                {coverUploading ? (
                  <span className="text-purple-600">Загрузка...</span>
                ) : (
                  <span>Нажмите, чтобы выбрать обложку</span>
                )}
              </button>
              <div className="text-center text-sm text-gray-400">или</div>
              <input
                type="url"
                value=""
                onChange={(e) => setForm((prev) => ({ ...prev, cover_image_url: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                placeholder="Вставьте URL изображения"
              />
            </div>
          )}
        </div>

        {/* Audio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Аудио</label>
          {form.audio_url ? (
            <div className="space-y-2">
              <audio src={form.audio_url} controls className="w-full" />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, audio_url: "" }))}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Удалить
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setAudioFile(file);
                  if (file) {
                    setAudioUploading(true);
                    setError("");
                    const fd = new FormData();
                    fd.append("file", file);
                    fetch("/api/upload/audio", { method: "POST", body: fd })
                      .then((r) => r.json())
                      .then((data) => {
                        if (data.url) {
                          setForm((prev) => ({ ...prev, audio_url: data.url }));
                          setAudioFile(null);
                        } else {
                          setError(data.error || "Ошибка загрузки аудио");
                        }
                      })
                      .catch(() => setError("Ошибка сети"))
                      .finally(() => setAudioUploading(false));
                  }
                }}
              />
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                disabled={audioUploading}
                className="w-full bg-gray-100 hover:bg-gray-200 px-4 py-8 rounded-lg text-sm disabled:opacity-50 border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors"
              >
                {audioUploading ? (
                  <span className="text-purple-600">Загрузка...</span>
                ) : (
                  <span>Нажмите, чтобы выбрать аудио-файл</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Status & Submit */}
        <div className="flex items-center gap-4 pt-4 border-t">
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="draft">Черновик</option>
            <option value="published">Опубликовать</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </form>
    </div>
  );
}
