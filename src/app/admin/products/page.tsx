"use client";

import { RequireAdmin } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Category, Product } from "@/lib/types";
import { adminProductSchema, getFirstValidationError } from "@/lib/validation";
import { formatCurrency, getProductImage } from "@/lib/utils";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  categoryId: string;
  imageUrls: string;
  active: boolean;
};

const ITEMS_PER_PAGE = 8;

function validateProductForm(form: ProductFormState) {
  return adminProductSchema.safeParse({
    name: form.name,
    description: form.description,
    price: Number(form.price),
    stockQuantity: Number(form.stockQuantity),
    categoryId: form.categoryId,
    imageUrls: form.imageUrls
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean),
    active: form.active
  });
}

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "out-of-stock">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc" | "stock-desc">("newest");
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "0",
    stockQuantity: "0",
    categoryId: "",
    imageUrls: "",
    active: true
  });

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "0",
    stockQuantity: "0",
    categoryId: "",
    imageUrls: "",
    active: true
  });

  const load = useCallback(async () => {
    const [cats, prods] = await Promise.all([api.listCategories(), api.listProducts()]);
    setCategories(cats);
    setProducts(prods);
    if (!form.categoryId && cats.length > 0) setForm((f) => ({ ...f, categoryId: String(cats[0].id) }));
  }, [form.categoryId]);

  useEffect(() => {
    load().catch((err) => setMessage((err as Error).message));
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!form.name.trim()) {
      setMessage("Product name is required.");
      return;
    }

    const parsed = validateProductForm(form);
    if (!parsed.success) {
      setMessage(getFirstValidationError(parsed.error));
      return;
    }
    const payload = parsed.data;

    try {
      setSubmitting(true);
      await api.createProduct(token, payload);
      setMessage("Product created.");
      setForm({
        name: "",
        description: "",
        price: "0",
        stockQuantity: "0",
        categoryId: form.categoryId,
        imageUrls: "",
        active: true
      });
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onUpdateProduct(e: FormEvent) {
    e.preventDefault();
    if (!token || !editingId) return;
    if (!editForm.name.trim()) {
      setMessage("Product name is required.");
      return;
    }

    const parsed = validateProductForm(editForm);
    if (!parsed.success) {
      setMessage(getFirstValidationError(parsed.error));
      return;
    }
    const payload = parsed.data;

    try {
      setUpdating(true);
      await api.updateProduct(token, editingId, payload);
      setMessage("Product updated.");
      setEditingId(null);
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setUpdating(false);
    }
  }

  async function onDelete(product: Product) {
    if (!token) return;
    const confirmed = window.confirm(`Delete product "${product.name}"?`);
    if (!confirmed) return;

    setMessage(null);
    setDeletingId(product.id);
    try {
      await api.deleteProduct(token, product.id);
      setMessage("Product deleted.");
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let result = products.filter((p) => {
      const inStock = p.stockQuantity > 0;
      const matchesStock = stockFilter === "all" || (stockFilter === "in-stock" ? inStock : !inStock);
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? p.active : !p.active);
      const matchesQuery =
        !normalizedQuery ||
        p.name.toLowerCase().includes(normalizedQuery) ||
        (p.description || "").toLowerCase().includes(normalizedQuery) ||
        p.category.name.toLowerCase().includes(normalizedQuery);
      return matchesStock && matchesStatus && matchesQuery;
    });

    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "stock-desc") result = [...result].sort((a, b) => b.stockQuantity - a.stockQuantity);
    return result;
  }, [products, query, stockFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <RequireAdmin>
      <section className="grid gap-6 xl:grid-cols-[minmax(280px,0.95fr)_1.2fr]">
        <div className="grid gap-6">
          <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur">
            <h1 className="text-2xl font-semibold text-slate-900">Product Studio</h1>
            <p className="mt-1 text-sm text-slate-600">Create new products and maintain stock visibility across the storefront.</p>
            <div className="mt-4 grid gap-3">
              <input
                className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <textarea
                className="min-h-24 rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                <input
                  className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                  placeholder="Stock"
                  type="number"
                  min={0}
                  value={form.stockQuantity}
                  onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                />
              </div>
              <select
                className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <textarea
                className="min-h-24 rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                placeholder="Image URLs (comma separated)"
                value={form.imageUrls}
                onChange={(e) => setForm({ ...form, imageUrls: e.target.value })}
              />
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Active product
              </label>
              <button
                disabled={submitting}
                className="rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? "Saving..." : "Save product"}
              </button>
              {message && <p className="text-sm text-slate-600">{message}</p>}
            </div>
          </form>

          {editingId ? (
            <form
              onSubmit={onUpdateProduct}
              className="rounded-3xl border border-brand-200 bg-brand-50/80 p-6 shadow-sm backdrop-blur"
            >
              <h2 className="text-xl font-semibold text-brand-800">Edit Product</h2>
              <div className="mt-4 grid gap-3">
                <input
                  className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                  placeholder="Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
                <textarea
                  className="min-h-24 rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                  placeholder="Description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                    placeholder="Price"
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  />
                  <input
                    className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                    placeholder="Stock"
                    type="number"
                    min={0}
                    value={editForm.stockQuantity}
                    onChange={(e) => setEditForm({ ...editForm, stockQuantity: e.target.value })}
                  />
                </div>
                <select
                  className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                  value={editForm.categoryId}
                  onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <textarea
                  className="min-h-24 rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-brand-500 focus:ring"
                  placeholder="Image URLs (comma separated)"
                  value={editForm.imageUrls}
                  onChange={(e) => setEditForm({ ...editForm, imageUrls: e.target.value })}
                />
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.active}
                    onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                  />
                  Active product
                </label>
                <div className="flex gap-2">
                  <button
                    disabled={updating}
                    className="rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {updating ? "Updating..." : "Update product"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 hover:bg-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur">
          <h2 className="text-xl font-semibold text-slate-900">Catalog</h2>
          <p className="mt-1 text-sm text-slate-600">Tap edit to update details without leaving this dashboard.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="Search product/category"
            />
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value as "all" | "in-stock" | "out-of-stock");
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="all">All stock</option>
              <option value="in-stock">In stock</option>
              <option value="out-of-stock">Out of stock</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "all" | "active" | "inactive");
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "price-asc" | "price-desc" | "stock-desc")}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-desc">Stock: High to Low</option>
            </select>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {pagedProducts.map((p) => (
              <article key={p.id} className="rounded-2xl border border-slate-200 p-3">
                <Image
                  src={getProductImage(p.imageUrls)}
                  alt={p.name}
                  width={640}
                  height={320}
                  className="h-32 w-full rounded-xl object-cover"
                />
                <p className="mt-3 line-clamp-1 font-medium text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-500">{p.category.name}</p>
                <p className="mt-1 text-sm font-semibold text-brand-700">{formatCurrency(p.price)}</p>
                <p className="text-xs text-slate-500">Stock: {p.stockQuantity}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEditingId(p.id);
                      setEditForm({
                        name: p.name,
                        description: p.description || "",
                        price: String(p.price),
                        stockQuantity: String(p.stockQuantity),
                        categoryId: String(p.category.id),
                        imageUrls: (p.imageUrls || []).join(", "),
                        active: p.active
                      });
                    }}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    disabled={deletingId === p.id}
                    className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === p.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!pagedProducts.length ? <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">No products found.</p> : null}
          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <p>
              Showing {pagedProducts.length} of {filteredProducts.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage <= 1}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Page {safePage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safePage >= totalPages}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </RequireAdmin>
  );
}
