"use client";

import { VirtualizedProductGrid } from "@/components/virtualized-product-grid";
import { api } from "@/lib/api";
import { Category, Product } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

type SortOption = "relevance" | "price-asc" | "price-desc" | "name-asc";
type StockFilter = "all" | "in-stock" | "out-of-stock";

const VALID_SORT_OPTIONS: SortOption[] = ["relevance", "price-asc", "price-desc", "name-asc"];
const VALID_STOCK_FILTERS: StockFilter[] = ["all", "in-stock", "out-of-stock"];

function isInStock(product: Product) {
  return product.active && product.stockQuantity > 0;
}

function parsePositiveNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function parseStockFilter(value: string | null): StockFilter {
  return VALID_STOCK_FILTERS.includes(value as StockFilter) ? (value as StockFilter) : "all";
}

function parseSortOption(value: string | null): SortOption {
  return VALID_SORT_OPTIONS.includes(value as SortOption) ? (value as SortOption) : "relevance";
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
        fontFamily: "inherit",
      }}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
        active
          ? "border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-200"
          : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-600"
      }`}
    >
      {label}
    </button>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstMount = useRef(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [stockFilter, setStockFilter] = useState<StockFilter>(parseStockFilter(searchParams.get("stock")));
  const [sortBy, setSortBy] = useState<SortOption>(parseSortOption(searchParams.get("sort")));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.listProducts(), api.listCategories()])
      .then(([loadedProducts, loadedCategories]) => {
        setProducts(loadedProducts);
        setCategories(loadedCategories);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setQuery(searchParams.get("q") || "");
    setSelectedCategory(searchParams.get("category") || "all");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setStockFilter(parseStockFilter(searchParams.get("stock")));
    setSortBy(parseSortOption(searchParams.get("sort")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (minPrice.trim()) params.set("minPrice", minPrice.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
    if (stockFilter !== "all") params.set("stock", stockFilter);
    if (sortBy !== "relevance") params.set("sort", sortBy);

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `/products?${next}` : "/products", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedCategory, minPrice, maxPrice, stockFilter, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const id = product.category?.id;
      if (!id) continue;
      counts.set(id, (counts.get(id) || 0) + 1);
    }
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const normalizedCategory = selectedCategory.trim().toLowerCase();
    const knownCategoryIds = new Set(products.map((p) => String(p.category.id)));
    const knownCategoryNames = new Set(products.map((p) => p.category.name.toLowerCase()));
    const effectiveCategory =
      normalizedCategory === "all" ||
      knownCategoryIds.has(normalizedCategory) ||
      knownCategoryNames.has(normalizedCategory)
        ? normalizedCategory
        : "all";

    let min = parsePositiveNumber(minPrice.trim());
    let max = parsePositiveNumber(maxPrice.trim());
    if (min != null && max != null && min > max) [min, max] = [max, min];

    let result = products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        (product.description || "").toLowerCase().includes(normalizedQuery) ||
        product.category.name.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        effectiveCategory === "all" ||
        String(product.category.id) === effectiveCategory ||
        product.category.name.toLowerCase() === effectiveCategory;

      const matchesMin = min == null || product.price >= min;
      const matchesMax = max == null || product.price <= max;

      const inStock = isInStock(product);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && inStock) ||
        (stockFilter === "out-of-stock" && !inStock);

      return matchesQuery && matchesCategory && matchesMin && matchesMax && matchesStock;
    });

    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === "name-asc") result = [...result].sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products, deferredQuery, selectedCategory, minPrice, maxPrice, stockFilter, sortBy]);

  const totalInStock = useMemo(() => products.filter(isInStock).length, [products]);

  function resetFilters() {
    setQuery("");
    setSelectedCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setStockFilter("all");
    setSortBy("relevance");
  }

  const hasActiveFilters =
    query || selectedCategory !== "all" || minPrice || maxPrice || stockFilter !== "all" || sortBy !== "relevance";

  return (
    <section className="space-y-6">

      {/* Filter panel */}
      <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Find your products</h2>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-2">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">🔍</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for anything..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
              />
            </div>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
            >
              <option value="all">Show all items</option>
              <option value="in-stock">Available now</option>
              <option value="out-of-stock">Coming soon</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
            >
              <option value="relevance">Best match</option>
              <option value="price-asc">Cheapest first</option>
              <option value="price-desc">Most expensive first</option>
              <option value="name-asc">A to Z</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill
              label={`All (${products.length})`}
              active={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}
            />
            {categories.map((cat) => {
              const active =
                selectedCategory === String(cat.id) ||
                selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <FilterPill
                  key={cat.id}
                  label={`${cat.name} (${categoryCounts.get(cat.id) || 0})`}
                  active={active}
                  onClick={() => setSelectedCategory(String(cat.id))}
                />
              );
            })}
          </div>
        </div>
      </article>

      <VirtualizedProductGrid products={filtered} viewportClassName="h-[70vh]" />
    </section>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
          Loading your shop…
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}