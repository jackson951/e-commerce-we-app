"use client";

import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  async function handleAdd() {
    if (!user?.customerId) {
      setMessage("Login as customer to add items.");
      return;
    }
    try {
      await addItem(product.id, 1);
      setMessage("Added to cart.");
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(22,76,193,0.18)]">
      <Link href={`/products/${product.id}`} className="block">
        <img
          src={product.imageUrls?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"}
          alt={product.name}
          className="h-48 w-full object-cover"
        />
      </Link>
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">{product.category.name}</p>
        <Link href={`/products/${product.id}`} className="line-clamp-1 text-lg font-semibold text-slate-900">
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-base font-bold text-brand-700">{formatCurrency(product.price)}</span>
          <button onClick={handleAdd} className="rounded-lg bg-brand-600 px-3 py-2 text-sm text-white hover:bg-brand-700">
            Add
          </button>
        </div>
        {message && <p className="text-xs text-slate-500">{message}</p>}
      </div>
    </article>
  );
}
