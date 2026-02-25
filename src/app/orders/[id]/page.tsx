"use client";

import { RequireAuth } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Order, PaymentTransaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { token, isAdmin, effectiveCustomerId } = useAuth();
  const orderId = params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !orderId) {
      setLoading(false);
      return;
    }

    if (!isAdmin && !effectiveCustomerId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const loadOrder = async () => {
      try {
        const [orderData, paymentData] = await Promise.all([api.getOrder(token, orderId), api.listOrderPayments(token, orderId)]);
        setOrder(orderData);
        setPayments(paymentData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [token, effectiveCustomerId, isAdmin, orderId]);

  return (
    <RequireAuth>
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">Order Details</h1>
          <Link href="/orders" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Back to orders
          </Link>
        </div>
        {loading ? (
          <p className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-600">Loading order...</p>
        ) : null}
        {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
        {!loading && !error && !order ? <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">Order not found.</p> : null}

        {order ? (
          <article className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Order Number</p>
                <p className="text-lg font-semibold text-slate-900">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    order.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {order.status === "PAID" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                  {order.status}
                </p>
                <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-brand-700">{formatCurrency(order.totalAmount)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {order.status === "PAID" ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Payment Approved</span>
              ) : (
                <Link
                  href={`/checkout/payment?orderId=${order.id}`}
                  className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Complete payment
                </Link>
              )}
            </div>
            <ul className="space-y-3">
              {(order.items || []).map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-slate-500">
                      Qty {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Payment attempts</p>
              {payments.length ? null : <p className="text-sm text-slate-500">No payment attempts yet.</p>}
              {payments.map((payment) => (
                <div key={payment.id} className="rounded-lg border border-slate-200 px-3 py-2">
                  <p className={`text-sm font-medium ${payment.status === "APPROVED" ? "text-emerald-700" : "text-red-700"}`}>
                    {payment.status}
                  </p>
                  <p className="text-xs text-slate-500">
                    {payment.gatewayResponseCode || "N/A"} | {payment.gatewayMessage || "No gateway message"}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(payment.processedAt)}</p>
                </div>
              ))}
            </div>
          </article>
        ) : null}
      </section>
    </RequireAuth>
  );
}
