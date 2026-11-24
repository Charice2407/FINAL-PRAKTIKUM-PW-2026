
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const emptyForm = {
  name: "",
  description: "",
};

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadCategories() {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setCategories(data.categories);
    } catch {
      setMessage("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openCreateForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setMessage("");
  }

  function openEditForm(category) {
    setForm({
      name: category.name,
      description: category.description || "",
    });
    setEditingId(category.id);
    setShowForm(true);
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/categories", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { ...form, id: editingId } : form
        ),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setShowForm(false);
        setForm(emptyForm);
        setEditingId(null);
        await loadCategories();
      }
    } catch {
      setMessage("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(category) {
    if (!confirm(`Hapus kategori ${category.name}?`)) return;

    try {
      const response = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: category.id }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) await loadCategories();
    } catch {
      setMessage("Gagal menghapus kategori.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/dashboard/admin" className="font-bold text-cyan-600">
            ← Admin Dashboard
          </Link>
          <span className="font-semibold text-slate-700">
            Category Management
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Category Management
            </h1>
            <p className="mt-2 text-slate-500">
              Kelola kategori untuk mengelompokkan course.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-white hover:bg-cyan-600"
          >
            + Tambah Kategori
          </button>
        </div>

        {message && (
          <p className="mt-5 rounded-lg bg-cyan-50 p-3 text-sm text-cyan-800">
            {message}
          </p>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl border bg-white p-6 shadow-sm"
          >
            <h2 className="mb-5 text-xl font-bold">
              {editingId ? "Edit Kategori" : "Tambah Kategori"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nama Kategori
                </label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  required
                  maxLength={100}
                  className="w-full rounded-lg border px-4 py-3"
                  placeholder="Contoh: Web Development"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Deskripsi
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border px-4 py-3"
                  placeholder="Deskripsi singkat kategori..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                disabled={saving}
                className="rounded-lg bg-cyan-500 px-5 py-2.5 font-semibold text-white hover:bg-cyan-600 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border px-5 py-2.5 font-semibold"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-slate-500">Memuat kategori...</p>
          ) : categories.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 text-slate-500">
              Belum ada kategori. Tambahkan kategori pertama.
            </div>
          ) : (
            categories.map((category) => (
              <article
                key={category.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {category.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {category.description || "Tidak ada deskripsi."}
                    </p>
                  </div>
                  <span className="rounded-lg bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                    Category
                  </span>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => openEditForm(category)}
                    className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(category)}
                    className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
