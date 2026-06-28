"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { storyCategories: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || undefined }),
    });

    if (res.ok) {
      const cat = await res.json();
      setCategories((prev) => [...prev, { ...cat, _count: { storyCategories: 0 } }]);
      setName("");
      setDescription("");
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить категорию? Сказки не удалятся, но потеряют категорию.")) return;
    setDeleting(id);
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Категории</h1>

      {/* Create */}
      <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название категории"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            required
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание (необязательно)"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
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

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="divide-y divide-gray-100">
          {categories.map((cat) => (
            <div key={cat.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <span className="font-medium">{cat.name}</span>
                <span className="text-sm text-gray-500 ml-3">
                  {cat._count.storyCategories} сказок
                </span>
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                disabled={deleting === cat.id}
                className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
              >
                {deleting === cat.id ? "..." : "Удалить"}
              </button>
            </div>
          ))}
        </div>
        {categories.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">Нет категорий</div>
        )}
      </div>
    </div>
  );
}
