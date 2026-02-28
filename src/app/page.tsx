"use client";

import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Category, Product } from "@/lib/types";
import { ArrowRight, Heart, ShieldCheck, Star, Truck, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const CATEGORY_IMAGES: Record<string, string> = {
  electronics:    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
  clothing:       "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
  fashion:        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
  shoes:          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  footwear:       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  furniture:      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  "home & living":"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  home:           "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  beauty:         "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
  cosmetics:      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
  sports:         "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
  fitness:        "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
  food:           "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  grocery:        "https://images.unsplash.com/photo-1543168256-418811576931?w=800&q=80",
  toys:           "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&q=80",
  kids:           "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&q=80",
  books:          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
  stationery:     "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80",
  garden:         "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
  automotive:     "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
  pets:           "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
  jewelry:        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
  accessories:    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
  bags:           "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
  health:         "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80",
  "https://images.unsplash.com/photo-1619033218078-7db8f53d4b7b?w=800&q=80",
];

function getCategoryImage(name: string, index: number): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_IMAGES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function AnimatedNumber({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current || target === 0) return;
    ref.current = true;
    const duration = 1200;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target]);
  return <>{display.toLocaleString()}</>;
}

function TrustBadge({ icon: Icon, label, sub, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; sub: string; color: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-xs text-white/60">{sub}</p>
      </div>
    </div>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const inStock = product.active && product.stockQuantity > 0;
  const discount = ((product.name.length + product.category.name.length) % 22) + 8;
  return (
    <article
      className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm"
      style={{ animation: `fadeSlideUp 0.5s ease both`, animationDelay: `${index * 60}ms` }}
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative overflow-hidden h-52">
          <Image
            src={product.imageUrls?.[0] || "/placeholder-product.jpg"}
            alt={product.name} fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="absolute top-3 left-3 rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-bold text-white shadow">
            -{discount}%
          </span>
          {!inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-slate-700 tracking-wide">Notify Me</span>
            </div>
          )}
          <button aria-label="Wishlist" className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 opacity-0 group-hover:opacity-100 transition-all shadow hover:bg-rose-50">
            <Heart className="h-4 w-4 text-rose-500" />
          </button>
        </div>
      </Link>
      <div className="p-4 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-500">{product.category.name}</p>
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-1 text-sm font-bold text-slate-900 hover:text-rose-600 transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
          <span className="ml-1 text-xs text-slate-400">(4.8)</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-base font-extrabold text-slate-900">R{product.price.toLocaleString()}</span>
          {inStock ? <span className="text-xs font-medium text-emerald-600">✓ In stock</span> : <span className="text-xs font-medium text-slate-400">Out of stock</span>}
        </div>
        <Link href={`/products/${product.id}`} className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-rose-600 transition-colors duration-200">
          View Product <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

// ── Category tile — height always comes from parent wrapper ──
function CategoryTile({ category, count, image, large = false }: {
  category: Category; count: number; image: string; large?: boolean;
}) {
  return (
    <Link
      href={`/categories/${category.id}`}
      className="group relative block h-full w-full overflow-hidden rounded-3xl"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image} alt={category.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50 mb-0.5">{count} products</p>
        <h3 className={`font-display font-black text-white ${large ? "text-2xl" : "text-lg"}`}>{category.name}</h3>
        <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-white/70 group-hover:text-rose-300 transition-colors">
          Shop now <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    Promise.all([api.listProducts(), api.listCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);
  const displayedCats = categories.slice(0, 6);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <span className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-rose-500 border-t-transparent" />
          <p className="text-sm text-slate-500 font-medium">Getting things ready for you…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatA {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-18px) rotate(6deg); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-12px) rotate(-4deg); }
        }
        .float-a { animation: floatA 7s ease-in-out infinite; }
        .float-b { animation: floatB 5s ease-in-out infinite; }
        .hero-shine {
          background: conic-gradient(from 180deg at 50% 50%,
            #0f172a 0deg,#1e1b4b 72deg,#0f172a 144deg,
            #1e1b4b 216deg,#0f172a 288deg,#0f172a 360deg);
        }
      `}</style>

      <div className="font-body space-y-20">

        {/* ── HERO ── */}
        <section className="hero-shine relative overflow-hidden rounded-3xl px-6 py-16 sm:py-24 lg:px-16">
          <div aria-hidden className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #f43f5e 0%, transparent 70%)" }} />
          <div aria-hidden className="pointer-events-none absolute top-10 right-10 h-56 w-56 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }} />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 right-1/3 h-64 w-64 rounded-full opacity-25" style={{ background: "radial-gradient(circle, #fb923c 0%, transparent 70%)" }} />
          <div aria-hidden className="float-a absolute right-24 top-12 h-16 w-16 rounded-2xl border border-white/10 bg-white/5" />
          <div aria-hidden className="float-b absolute right-40 bottom-16 h-10 w-10 rounded-xl border border-rose-500/20 bg-rose-500/10" />

          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
            <div className="space-y-7" style={{ animation: "fadeSlideUp 0.7s ease both" }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-rose-300">
                <Zap className="h-3 w-3" /> South Africa's Favourite Store
              </span>
              <h1 className="font-display text-5xl font-black leading-[1.1] text-white sm:text-6xl xl:text-7xl">
                Shop what<br /><span className="text-rose-400">moves you.</span>
              </h1>
              <p className="max-w-md text-base text-white/60 leading-relaxed">
                Thousands of products, hand-picked deals, and speedy delivery straight to your door. No fuss, just great shopping.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-all hover:scale-105 active:scale-100">
                  Start Shopping <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/categories" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                  Browse Categories
                </Link>
              </div>
              <div className="grid gap-4 pt-2 sm:grid-cols-3">
                <TrustBadge icon={Truck}       color="bg-emerald-500/20 text-emerald-400" label="Fast Delivery"  sub="Nationwide, tracked" />
                <TrustBadge icon={ShieldCheck} color="bg-sky-500/20 text-sky-400"         label="Safe Checkout"  sub="Your card is protected" />
                <TrustBadge icon={Heart}       color="bg-rose-500/20 text-rose-400"        label="Always Here"   sub="Support every day" />
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:items-end" style={{ animation: "fadeSlideUp 0.7s ease 0.15s both" }}>
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-7 space-y-5 w-full max-w-xs">
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">Why shop with us?</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Happy customers</span>
                    <span className="font-display text-2xl font-black text-white"><AnimatedNumber target={10000} />+</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Categories to explore</span>
                    <span className="font-display text-2xl font-black text-white"><AnimatedNumber target={categories.length} /></span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Years of trust</span>
                    <span className="font-display text-2xl font-black text-white">5+</span>
                  </div>
                </div>
                <Link href="/products" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-900 hover:bg-rose-50 transition-colors">
                  See all deals <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-rose-500">Browse by category</p>
              <h2 className="font-display text-4xl font-black text-slate-900 leading-tight">
                What are you<br />looking for today?
              </h2>
            </div>
            <Link href="/categories" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-rose-600 transition-colors">
              All categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {displayedCats.length > 0 && (
            <>
              {/*
                DESKTOP (lg+): flex row — hero card on left (460px tall, fixed width),
                remaining cards in a 3-col grid on the right (two rows of 220px).
                Heights are set via inline style so they are never ambiguous.
              */}
              <div className="hidden lg:flex gap-4" style={{ height: 460 }}>
                {/* Hero — left column */}
                <div className="w-72 shrink-0 h-full">
                  <CategoryTile
                    category={displayedCats[0]}
                    count={products.filter((p) => p.category.id === displayedCats[0].id).length}
                    image={getCategoryImage(displayedCats[0].name, 0)}
                    large
                  />
                </div>

                {/* Rest — right grid (up to 5 more cards, 2 rows × 3 cols) */}
                <div className="flex-1 grid grid-cols-3 gap-4" style={{ gridTemplateRows: "1fr 1fr" }}>
                  {displayedCats.slice(1).map((cat, i) => (
                    <div key={cat.id} className="h-full">
                      <CategoryTile
                        category={cat}
                        count={products.filter((p) => p.category.id === cat.id).length}
                        image={getCategoryImage(cat.name, i + 1)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* MOBILE / TABLET: simple uniform grid, all cards same height */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:hidden">
                {displayedCats.map((cat, i) => (
                  <div key={cat.id} style={{ height: 220 }}>
                    <CategoryTile
                      category={cat}
                      count={products.filter((p) => p.category.id === cat.id).length}
                      image={getCategoryImage(cat.name, i)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── FEATURED PRODUCTS ── */}
        <section>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-rose-500">Handpicked for you</p>
              <h2 className="font-display text-4xl font-black text-slate-900 leading-tight">Today's top picks</h2>
            </div>
            <Link href="/products" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-rose-600 transition-colors">
              See everything <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/products" className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-900 px-8 py-3.5 text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-all">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          className="relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #be123c 60%, #0f172a 100%)" }}
        >
          <div aria-hidden className="pointer-events-none absolute -top-12 left-1/4 h-56 w-56 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #fb923c, transparent 70%)" }} />
          <div aria-hidden className="pointer-events-none absolute -bottom-10 right-1/4 h-40 w-40 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }} />
          <div className="relative space-y-6 max-w-xl mx-auto">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-widest">
              🎉 Join thousands of shoppers
            </span>
            <h2 className="font-display text-4xl font-black leading-tight">
              Ready to find your<br />next favourite thing?
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              New arrivals every week, great prices always, and delivery you can count on.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="rounded-2xl bg-white px-8 py-4 text-sm font-bold text-slate-900 hover:bg-rose-50 hover:scale-105 transition-all shadow-xl">
                Shop Now
              </Link>
              {!user && (
                <Link href="/register" className="rounded-2xl border-2 border-white/30 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                  Create a Free Account
                </Link>
              )}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}