"use client";

import { RequireAdmin } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";
import { FormEvent, useEffect, useState } from "react";

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setCategories(await api.listCategories());
  }

  useEffect(() => {
    load().catch((err) => setMessage((err as Error).message));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!name.trim()) {
      setMessage("Category name is required.");
      return;
    }
    try {
      setSubmitting(true);
      await api.createCategory(token, { name, description });
      setName("");
      setDescription("");
      setMessage("Category created.");
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onSaveEdit(categoryId: number) {
    if (!token) return;
    if (!editName.trim()) {
      setMessage("Category name is required.");
      return;
    }

    setMessage(null);
    setSavingId(categoryId);
    try {
      await api.updateCategory(token, categoryId, {
        name: editName.trim(),
        description: editDescription.trim()
      });
      setEditingId(null);
      setEditName("");
      setEditDescription("");
      setMessage("Category updated.");
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  async function onDelete(category: Category) {
    if (!token) return;
    const confirmed = window.confirm(`Delete category "${category.name}"?`);
    if (!confirmed) return;

    setMessage(null);
    setDeletingId(category.id);
    try {
      await api.deleteCategory(token, category.id);
      setMessage("Category deleted.");
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <RequireAdmin>
      <section className="grid gap-6 lg:grid-cols-[minmax(260px,0.9fr)_1fr]">
        <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-semibold text-slate-900">Category Studio</h1>
          <p className="mt-1 text-sm text-slate-600">Create and maintain category labels used across your catalog.</p>
          <div className="mt-4 grid gap-3">
            <input
              className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
              placeholder="Category name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              className="min-h-24 rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button
              disabled={submitting}
              className="rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? "Saving..." : "Save category"}
            </button>
            {message && <p className="text-sm text-slate-600">{message}</p>}
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur">
          <h2 className="text-xl font-semibold text-slate-900">Existing Categories</h2>
          <ul className="mt-4 space-y-3">
            {categories.map((c) => (
              <li key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                {editingId === c.id ? (
                  <div className="grid gap-3">
                    <input
                      className="rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <textarea
                      className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onSaveEdit(c.id)}
                        disabled={savingId === c.id}
                        className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {savingId === c.id ? "Updating..." : "Update"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditName("");
                          setEditDescription("");
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{c.description || "No description"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditName(c.name);
                          setEditDescription(c.description || "");
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(c)}
                        disabled={deletingId === c.id}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === c.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </RequireAdmin>
  );
}
