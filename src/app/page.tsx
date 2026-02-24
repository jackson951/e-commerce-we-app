"use client";

import { ProductCard } from "@/components/product-card";
import { api } from "@/lib/api";
import { Product } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listProducts()
      .then(setProducts)
      .catch((err) => setError((err as Error).message));
  }, []);

  const filtered = useMemo(() => {
    if (!query) return products;
    return products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  }, [products, query]);

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-brand-700 to-brand-500 p-8 text-white shadow-[0_24px_50px_rgba(21,92,219,0.35)]">
        <p className="text-sm uppercase tracking-[0.25em] text-white/80">Modern Commerce</p>
        <h1 className="mt-2 text-4xl font-bold">Launch-ready shopping experience</h1>
        <p className="mt-2 max-w-2xl text-white/85">
          Browse products, manage cart, checkout orders, and use admin tools from one polished Next.js app.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Featured Products</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full max-w-sm rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none ring-brand-500 focus:ring"
        />
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
