"use client";

import { RequireAdmin } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";
import { CheckCircle2, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100";

export default function AdminCategoriesPage() {
  const { token } = useAuth();

  const [categories, setCategories]     = useState<Category[]>([]);
  const [name, setName]                 = useState("");
  const [description, setDescription]   = useState("");
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [editName, setEditName]         = useState("");
  const [editDesc, setEditDesc]         = useState("");
  const [savingId, setSavingId]         = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [submitting, setSubmitting]     = useState(false);
  const [message, setMessage]           = useState<{ text: string; type: "success" | "error" } | null>(null);

  function notify(text: string, type: "success" | "error" = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  async function load() {
    setCategories(await api.listCategories());
  }

  useEffect(() => {
    load().catch((err) => notify((err as Error).message, "error"));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !name.trim()) return;
    setSubmitting(true);
    try {
      await api.createCategory(token, { name: name.trim(), description: description.trim() });
      setName("");
      setDescription("");
      notify("Category created successfully.");
      await load();
    } catch (err) {
      notify((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function onSaveEdit(id: string) {
    if (!token || !editName.trim()) return;
    setSavingId(id);
    try {
      await api.updateCategory(token, id, { name: editName.trim(), description: editDesc.trim() });
      setEditingId(null);
      notify("Category updated.");
      await load();
    } catch (err) {
      notify((err as Error).message, "error");
    } finally {
      setSavingId(null);
    }
  }

  async function onDelete(category: Category) {
    if (!token) return;
    if (!window.confirm(`Delete "${category.name}"? This cannot be undone.`)) return;
    setDeletingId(category.id);
    try {
      await api.deleteCategory(token, category.id);
      notify("Category deleted.");
      await load();
    } catch (err) {
      notify((err as Error).message, "error");
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDesc(c.description || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDesc("");
  }

  return (
    <RequireAdmin>
      <div className="space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Categories</h1>
            <p className="text-sm text-slate-500">Create and manage the categories shown across your store.</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-600 shadow-sm">
            {categories.length} total
          </span>
        </div>

        {/* Toast notification */}
        {message && (
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {message.text}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">

          {/* ── Create form ── */}
          <form
            onSubmit={onSubmit}
            className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center gap-2">
              <Plus className="h-5 w-5 text-rose-500" />
              <h2 className="font-bold text-slate-900">Add new category</h2>
            </div>

            <div className="space-y-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">Category name</span>
                <input
                  className={inputClass}
                  placeholder="e.g. Electronics"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">
                  Description <span className="font-normal text-slate-400">(optional)</span>
                </span>
                <textarea
                  className={inputClass + " min-h-24 resize-none"}
                  placeholder="A short description of this category…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <button
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Add category
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ── Category list ── */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4 flex items-center gap-2">
              <Tag className="h-4 w-4 text-rose-500" />
              <h2 className="font-bold text-slate-900">All categories</h2>
            </div>

            {categories.length === 0 && (
              <div className="p-10 text-center">
                <Tag className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">No categories yet</p>
                <p className="mt-1 text-xs text-slate-400">Add your first one using the form.</p>
              </div>
            )}

            <ul className="divide-y divide-slate-100">
              {categories.map((c) => (
                <li key={c.id} className="px-5 py-4">
                  {editingId === c.id ? (
                    /* Edit mode */
                    <div className="space-y-3">
                      <input
                        className={inputClass}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Category name"
                      />
                      <textarea
                        className={inputClass + " min-h-20 resize-none"}
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description (optional)"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSaveEdit(c.id)}
                          disabled={savingId === c.id}
                          className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600 transition-colors disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {savingId === c.id ? (
                            <>
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Saving…
                            </>
                          ) : "Save changes"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{c.name}</p>
                        <p className="mt-0.5 text-sm text-slate-400 truncate">
                          {c.description || <span className="italic">No description</span>}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => startEdit(c)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-white transition-all"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => onDelete(c)}
                          disabled={deletingId === c.id}
                          className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === c.id ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          {deletingId === c.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </RequireAdmin>
  );
}