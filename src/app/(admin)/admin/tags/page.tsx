"use client";

import { useState, useEffect } from "react";

interface Tag {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then(setTags);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);

    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      const tag = await res.json();
      setTags((prev) => [...prev, { ...tag, usageCount: 0 }]);
      setName("");
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить тег?")) return;
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Теги</h1>

      <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название тега"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {creating ? "..." : "Добавить"}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex flex-wrap gap-2 p-6">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {tag.name} ({tag.usageCount})
              <button
                onClick={() => handleDelete(tag.id)}
                className="text-purple-500 hover:text-purple-700"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        {tags.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">Нет тегов</div>
        )}
      </div>
    </div>
  );
}
