"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";

interface Story {
  id: string;
  title: string;
  storyText: string;
  audioUrl: string | null;
  coverImageUrl: string | null;
  status: string;
  categoryId: string | null;
  metadata: Record<string, unknown>;
  paragraphs: { id: string; content: string; paragraphIndex: number }[];
  tags: { tag: { id: string; name: string } }[];
  seo_metadata: {
    seoTitle: string | null;
    seoDescription: string | null;
    ogImage: string | null;
    keywords: string[];
  } | null;
}

interface Category {
  id: string;
  name: string;
}

export default function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/stories/${id}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([s, c]) => {
      setStory(s);
      setCategories(c);
    });
  }, [id]);

  const handleImageUpload = async () => {
    if (!imageFiles.length) return;
    setImageUploading(true);
    const fd = new FormData();
    imageFiles.forEach((f) => fd.append("files", f));
    const res = await fetch("/api/upload/images", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      // Append to story images
      setStory((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          paragraphs: prev.paragraphs,
        };
      });
    }
    setImageUploading(false);
    setImageFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story) return;
    setSaving(true);

    const meta = { ...story.metadata };

    await fetch(`/api/stories/${story.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: story.title,
        story_text: story.storyText,
        category_id: story.categoryId,
        status: story.status,
        metadata: meta,
        audio_url: story.audioUrl,
        cover_image_url: story.coverImageUrl,
        tags: [...new Set(story.tags.map((t) => t.tag.name).filter(Boolean))],
      }),
    });

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!story || !confirm("Удалить сказку?")) return;
    setDeleting(true);
    await fetch(`/api/stories/${story.id}`, { method: "DELETE" });
    router.push("/admin/stories");
  };

  const updateStory = (field: string, value: unknown) =>
    setStory((prev) => (prev ? { ...prev, [field]: value } : prev));

  if (!story) {
    return <div className="text-gray-500">Загрузка...</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Редактирование</h1>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          {deleting ? "Удаление..." : "Удалить сказку"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
          <input
            type="text"
            value={story.title}
            onChange={(e) => updateStory("title", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        {/* Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Текст сказки <span className="text-gray-400">(Markdown)</span>
          </label>
          <textarea
            value={story.storyText}
            onChange={(e) => updateStory("storyText", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-purple-500"
            rows={20}
            required
          />
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <select
              value={story.categoryId || ""}
              onChange={(e) => updateStory("categoryId", e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Без категории</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Возраст от</label>
            <select
              value={String(story.metadata.age_min || 3)}
              onChange={(e) =>
                updateStory("metadata", { ...story.metadata, age_min: parseInt(e.target.value) })
              }
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
              value={String(story.metadata.age_max || 7)}
              onChange={(e) =>
                updateStory("metadata", { ...story.metadata, age_max: parseInt(e.target.value) })
              }
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
              value={String(story.metadata.difficulty || "Легкая")}
              onChange={(e) =>
                updateStory("metadata", { ...story.metadata, difficulty: e.target.value })
              }
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Теги</label>
          <input
            type="text"
            value={story.tags.map((t) => t.tag.name).join(", ")}
            onChange={(e) => {
              const tagNames = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
              updateStory(
                "tags",
                tagNames.map((name) => ({ tag: { id: "", name } }))
              );
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="дружба, лес, животные"
          />
        </div>

        {/* Audio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Аудио</label>
          {story.audioUrl ? (
            <div className="space-y-2">
              <audio src={story.audioUrl} controls className="w-full" />
              <button
                type="button"
                onClick={() => updateStory("audioUrl", null)}
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
                    const fd = new FormData();
                    fd.append("file", file);
                    fetch("/api/upload/audio", { method: "POST", body: fd })
                      .then((r) => r.json())
                      .then((data) => {
                        if (data.url) {
                          setStory((prev) => prev ? { ...prev, audioUrl: data.url } : prev);
                          setAudioFile(null);
                        }
                      })
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

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Обложка</label>
          {story.coverImageUrl ? (
            <div className="space-y-2">
              <img
                src={story.coverImageUrl}
                alt="Обложка"
                className="h-40 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => updateStory("coverImageUrl", null)}
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
                    const fd = new FormData();
                    fd.append("files", file);
                    fetch("/api/upload/images", { method: "POST", body: fd })
                      .then((r) => r.json())
                      .then((data) => {
                        if (data.files?.[0]) {
                          setStory((prev) => prev ? { ...prev, coverImageUrl: data.files[0].url } : prev);
                          setCoverFile(null);
                        }
                      })
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
                onChange={(e) => updateStory("coverImageUrl", e.target.value || null)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                placeholder="Вставьте URL изображения"
              />
            </div>
          )}
        </div>

        {/* SEO */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">SEO</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
              <input
                type="text"
                value={story.seo_metadata?.seoTitle || ""}
                onChange={(e) =>
                  setStory((prev) =>
                    prev
                      ? {
                          ...prev,
                          seo_metadata: {
                            ...prev.seo_metadata,
                            seoTitle: e.target.value,
                            seoDescription: prev.seo_metadata?.seoDescription || null,
                            ogImage: prev.seo_metadata?.ogImage || null,
                            keywords: prev.seo_metadata?.keywords || [],
                          },
                        }
                      : prev
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                maxLength={60}
                placeholder="Авто из заголовка"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                value={story.seo_metadata?.seoDescription || ""}
                onChange={(e) =>
                  setStory((prev) =>
                    prev
                      ? {
                          ...prev,
                          seo_metadata: {
                            ...prev.seo_metadata,
                            seoTitle: prev.seo_metadata?.seoTitle || null,
                            seoDescription: e.target.value,
                            ogImage: prev.seo_metadata?.ogImage || null,
                            keywords: prev.seo_metadata?.keywords || [],
                          },
                        }
                      : prev
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                maxLength={160}
                rows={2}
                placeholder="Авто из текста"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4 border-t">
          <select
            value={story.status}
            onChange={(e) => updateStory("status", e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="draft">Черновик</option>
            <option value="published">Опубликовано</option>
            <option value="archived">В архив</option>
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
