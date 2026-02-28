"use client";

import { RequireAdmin } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowRight,
  LayoutGrid,
  Package,
  ShoppingBag,
  ShoppingCart,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function NavCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
  accent = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string | number;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        accent
          ? "border-rose-200 bg-gradient-to-br from-rose-500 to-rose-600 text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      {/* Decorative circle */}
      <div
        aria-hidden
        className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 transition-transform duration-300 group-hover:scale-125 ${
          accent ? "bg-white" : "bg-rose-500"
        }`}
      />

      <div className="relative">
        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${
          accent ? "bg-white/20" : "bg-rose-50"
        }`}>
          <Icon className={`h-5 w-5 ${accent ? "text-white" : "text-rose-500"}`} />
        </div>
        <h2 className={`text-lg font-extrabold ${accent ? "text-white" : "text-slate-900"}`}>{title}</h2>
        <p className={`mt-1 text-sm leading-relaxed ${accent ? "text-white/70" : "text-slate-500"}`}>
          {description}
        </p>
      </div>

      <div className="relative mt-5 flex items-center justify-between">
        {badge !== undefined ? (
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${
            accent ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
          }`}>
            {badge}
          </span>
        ) : <span />}
        <span className={`flex items-center gap-1 text-xs font-bold transition-transform duration-200 group-hover:translate-x-1 ${
          accent ? "text-white/80" : "text-rose-500"
        }`}>
          Open <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

export default function AdminPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    inProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api.listProducts(),
      api.listCategories(),
      api.adminListOrders(token),
      api.adminListUsers(token),
    ])
      .then(([products, categories, orders, users]) => {
        const revenue    = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        const inProgress = orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length;
        setStats({
          products: products.length,
          categories: categories.length,
          orders: orders.length,
          users: users.length,
          revenue,
          inProgress,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <RequireAdmin>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 shadow-lg">
            <LayoutGrid className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Your store at a glance — manage everything from here.</p>
          </div>
        </div>

        {/* Stats row */}
        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
            Loading store data…
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Revenue"
              value={formatCurrency(stats.revenue)}
              sub="across all orders"
              icon={TrendingUp}
              color="bg-rose-50 text-rose-500"
            />
            <StatCard
              label="Total Orders"
              value={stats.orders}
              sub={`${stats.inProgress} in progress`}
              icon={ShoppingCart}
              color="bg-amber-50 text-amber-500"
            />
            <StatCard
              label="Products"
              value={stats.products}
              sub={`across ${stats.categories} categories`}
              icon={ShoppingBag}
              color="bg-blue-50 text-blue-500"
            />
            <StatCard
              label="Registered Users"
              value={stats.users}
              sub="all time"
              icon={Users}
              color="bg-emerald-50 text-emerald-600"
            />
          </div>
        )}

        {/* Section label */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Quick access</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <NavCard
              href="/admin/orders"
              icon={ShoppingCart}
              title="Orders"
              description="View, track and advance every order placed in your store."
              badge={stats.inProgress > 0 ? `${stats.inProgress} need attention` : `${stats.orders} total`}
              accent
            />
            <NavCard
              href="/admin/products"
              icon={Package}
              title="Products"
              description="Add new products, update pricing, stock, and images."
              badge={`${stats.products} products`}
            />
            <NavCard
              href="/admin/categories"
              icon={Tag}
              title="Categories"
              description="Create and organise the categories shown across your store."
              badge={`${stats.categories} categories`}
            />
            <NavCard
              href="/admin/users"
              icon={Users}
              title="Users"
              description="Manage roles, update details, and control account access."
              badge={`${stats.users} users`}
            />
          </div>
        </div>

      </div>
    </RequireAdmin>
  );
}