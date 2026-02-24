"use client";

import { RequireAuth } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const { user, token, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user?.customerId || isAdmin) return;
    api.listOrders(token, user.customerId).then(setOrders).catch((err) => setError((err as Error).message));
  }, [token, user?.customerId, isAdmin]);

  return (
    <RequireAuth>
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold">My Orders</h1>
        {isAdmin ? <p className="rounded-xl bg-white p-4">Admins should use API/DB or add admin order dashboards.</p> : null}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!orders.length && !isAdmin ? <p className="rounded-xl bg-white p-4">No orders yet.</p> : null}
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="text-sm uppercase text-slate-500">{order.status}</p>
              </div>
              <p className="mt-1 text-sm text-slate-500">{formatDate(order.createdAt)}</p>
              <p className="mt-2 font-semibold text-brand-700">{formatCurrency(order.totalAmount)}</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.productName} x {item.quantity} - {formatCurrency(item.subtotal)}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </RequireAuth>
  );
}
