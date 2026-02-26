"use client";

import { RequireAdmin } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { getNextTrackingStatus, getOrderStatusLabel } from "@/lib/order-tracking";
import { Order } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function getCustomerLabel(order: Order) {
  return order.customerName || order.customer?.fullName || `Customer #${order.customerId ?? "N/A"}`;
}

function getCustomerEmail(order: Order) {
  return order.customerEmail || order.customer?.email || "No email";
}

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "amount-desc" | "amount-asc">("newest");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    api
      .adminListOrders(token)
      .then(setOrders)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [token]);

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0), [orders]);
  const inProgressCount = useMemo(() => orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status)).length, [orders]);
  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let result = orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || String(order.status).toUpperCase() === statusFilter;
      const customerLabel = getCustomerLabel(order).toLowerCase();
      const customerEmail = getCustomerEmail(order).toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        order.orderNumber.toLowerCase().includes(normalizedQuery) ||
        customerLabel.includes(normalizedQuery) ||
        customerEmail.includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });

    if (sortBy === "amount-desc") result = [...result].sort((a, b) => b.totalAmount - a.totalAmount);
    if (sortBy === "amount-asc") result = [...result].sort((a, b) => a.totalAmount - b.totalAmount);
    return result;
  }, [orders, query, statusFilter, sortBy]);
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pagedOrders = filteredOrders.slice((safePage - 1) * perPage, safePage * perPage);
  const statuses = useMemo(() => {
    const all = Array.from(new Set(orders.map((order) => String(order.status).toUpperCase())));
    return ["all", ...all];
  }, [orders]);

  async function advanceStage(order: Order) {
    if (!token) return;
    const next = getNextTrackingStatus(order.status);
    if (!next) return;
    setError(null);
    setMessage(null);
    setUpdatingOrderId(order.id);
    try {
      const updated = await api.adminUpdateOrderStatus(token, order.id, next);
      setOrders((prev) => prev.map((entry) => (entry.id === order.id ? { ...entry, status: updated.status } : entry)));
      setMessage(`Order ${order.orderNumber} moved to ${getOrderStatusLabel(updated.status)}.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <RequireAdmin>
      <section className="space-y-6">
        <h1 className="text-3xl font-semibold">All Orders</h1>

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Total Orders</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{orders.length}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Gross Revenue</p>
            <p className="mt-1 text-2xl font-bold text-brand-700">{formatCurrency(totalRevenue)}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">In-Progress Orders</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{inProgressCount}</p>
          </article>
        </div>

        {loading ? <p className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading orders...</p> : null}
        {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p> : null}
        {!loading && !error && !orders.length ? <p className="rounded-xl bg-white p-4 text-sm">No orders found.</p> : null}
        {!loading && !error ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="Search order/customer/email"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All statuses" : status}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "amount-desc" | "amount-asc")}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="newest">Sort: Newest</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        ) : null}

        <div className="space-y-3">
          {pagedOrders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                  {getOrderStatusLabel(order.status)}
                </span>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
                  <p className="text-sm font-medium text-slate-800">{getCustomerLabel(order)}</p>
                  <p className="text-xs text-slate-500">{getCustomerEmail(order)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Items</p>
                  <p className="text-sm font-medium text-slate-800">{order.items?.length ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                  <p className="text-sm font-semibold text-brand-700">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link href={`/orders/${order.id}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                  Tracking details
                </Link>
                {getNextTrackingStatus(order.status) ? (
                  <button
                    type="button"
                    onClick={() => advanceStage(order)}
                    disabled={updatingOrderId === order.id}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {updatingOrderId === order.id
                      ? "Updating..."
                      : `Move to ${getOrderStatusLabel(getNextTrackingStatus(order.status) || order.status)}`}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
          {!loading && !error && !pagedOrders.length ? (
            <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">No orders match your filters.</p>
          ) : null}
        </div>
        {!loading && !error ? (
          <div className="flex items-center justify-between text-sm text-slate-600">
            <p>
              Showing {pagedOrders.length} of {filteredOrders.length}
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
        ) : null}
      </section>
    </RequireAdmin>
  );
}
