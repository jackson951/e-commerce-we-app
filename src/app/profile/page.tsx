"use client";

import { PaymentMethodForm } from "@/components/payment-method-form";
import { RequireAuth } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { CustomerProfile, PaymentMethod } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  CreditCard,
  MapPin,
  Phone,
  Plus,
  ShoppingBasket,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-slate-700">
        {label}
        {hint && <span className="ml-1 font-normal text-slate-400">({hint})</span>}
      </span>
      {children}
    </label>
  );
}

function CardRow({
  method,
  working,
  onSetDefault,
  onToggle,
}: {
  method: PaymentMethod;
  working: boolean;
  onSetDefault: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border px-5 py-4 transition-all ${
        method.defaultMethod
          ? "border-rose-200 bg-rose-50"
          : method.enabled
          ? "border-slate-200 bg-white"
          : "border-slate-200 bg-slate-50 opacity-60"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Card info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-[10px] font-bold uppercase text-slate-500 shadow-sm">
            {method.brand?.slice(0, 4) || "Card"}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              •••• •••• •••• {method.last4}
              {method.defaultMethod && (
                <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                  Default
                </span>
              )}
              {!method.enabled && (
                <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  Disabled
                </span>
              )}
            </p>
            <p className="text-xs text-slate-400">
              {method.cardHolderName} · Expires {String(method.expiryMonth).padStart(2, "0")}/{method.expiryYear}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!method.defaultMethod && method.enabled && (
            <button
              disabled={working}
              onClick={onSetDefault}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-50"
            >
              Set as default
            </button>
          )}
          <button
            disabled={working}
            onClick={onToggle}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
              method.enabled
                ? "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            }`}
          >
            {method.enabled ? "Disable" : "Enable"}
          </button>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">Added {formatDate(method.createdAt)}</p>
    </div>
  );
}

export default function ProfilePage() {
  const {
    token,
    refreshUser,
    effectiveCustomerId,
    canUseCustomerFeatures,
    hasAdminRole,
    viewMode,
  } = useAuth();

  const [profile, setProfile]               = useState<CustomerProfile | null>(null);
  const [methods, setMethods]               = useState<PaymentMethod[]>([]);
  const [loading, setLoading]               = useState(true);
  const [savingProfile, setSavingProfile]   = useState(false);
  const [savingMethod, setSavingMethod]     = useState(false);
  const [workingMethodId, setWorkingMethodId] = useState<string | null>(null);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [message, setMessage]               = useState<string | null>(null);
  const [error, setError]                   = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [address, setAddress]   = useState("");

  const loadData = useCallback(async () => {
    if (!token || !effectiveCustomerId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const [customer, paymentMethods] = await Promise.all([
        api.getCustomer(token, effectiveCustomerId),
        api.listPaymentMethods(token, effectiveCustomerId),
      ]);
      setProfile(customer);
      setMethods(paymentMethods);
      setFullName(customer.fullName);
      setEmail(customer.email);
      setPhone(customer.phone || "");
      setAddress(customer.address || "");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token, effectiveCustomerId]);

  useEffect(() => { loadData().catch(() => undefined); }, [loadData]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await api.updateCustomer(token, effectiveCustomerId!, {
        fullName,
        email,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      setProfile(updated);
      setMessage("Your profile has been updated.");
      await refreshUser();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSetDefault(methodId: string) {
    if (!token) return;
    setWorkingMethodId(methodId);
    setError(null);
    setMessage(null);
    try {
      await api.setDefaultPaymentMethod(token, effectiveCustomerId!, methodId);
      setMethods(await api.listPaymentMethods(token, effectiveCustomerId!));
      setMessage("Default card updated.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setWorkingMethodId(null);
    }
  }

  async function handleToggle(method: PaymentMethod) {
    if (!token) return;
    setWorkingMethodId(method.id);
    setError(null);
    setMessage(null);
    try {
      await api.setPaymentMethodEnabled(token, effectiveCustomerId!, method.id, !method.enabled);
      setMethods(await api.listPaymentMethods(token, effectiveCustomerId!));
      setMessage(method.enabled ? "Card disabled." : "Card enabled.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setWorkingMethodId(null);
    }
  }

  return (
    <RequireAuth>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 shadow-lg shadow-rose-500/25">
            <ShoppingBasket className="h-4 w-4 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My Profile</h1>
            <p className="text-sm text-slate-500">Manage your personal details and saved payment cards.</p>
          </div>
        </div>

        {/* Access warning */}
        {!canUseCustomerFeatures && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {hasAdminRole && viewMode === "ADMIN"
              ? "Switch to Customer View to manage your profile."
              : "This account doesn't have a customer profile."}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
            Loading your profile…
          </div>
        )}

        {/* Global error / success */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {message && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {message}
          </div>
        )}

        {effectiveCustomerId && profile && (
          <div className="grid gap-6 lg:grid-cols-2">

            {/* ── Personal details ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <UserRound className="h-5 w-5 text-rose-500" />
                <h2 className="font-bold text-slate-900">Personal details</h2>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <Field label="Full name">
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                    placeholder="Jane Doe"
                  />
                </Field>
                <Field label="Email address">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="Phone number" hint="optional">
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass + " pl-10"}
                      placeholder="+27 82 123 4567"
                    />
                  </div>
                </Field>
                <Field label="Delivery address" hint="optional">
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={inputClass + " pl-10 resize-none"}
                      placeholder="Cape Town, South Africa"
                      rows={3}
                    />
                  </div>
                </Field>

                <button
                  disabled={savingProfile}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {savingProfile ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving…
                    </>
                  ) : "Save changes"}
                </button>
              </form>
            </div>

            {/* ── Payment methods ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-rose-500" />
                  <h2 className="font-bold text-slate-900">Saved cards</h2>
                </div>
                <button
                  onClick={() => setIsAddingMethod((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-all"
                >
                  {isAddingMethod ? (
                    <><X className="h-3.5 w-3.5" /> Cancel</>
                  ) : (
                    <><Plus className="h-3.5 w-3.5" /> Add card</>
                  )}
                </button>
              </div>

              {/* Add card form */}
              {isAddingMethod && (
                <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <PaymentMethodForm
                    defaultBillingAddress={address}
                    submitting={savingMethod}
                    buttonLabel="Save card"
                    onSubmit={async (payload) => {
                      if (!token) return;
                      setSavingMethod(true);
                      setMessage(null);
                      setError(null);
                      try {
                        await api.createPaymentMethod(token, effectiveCustomerId, payload);
                        setMethods(await api.listPaymentMethods(token, effectiveCustomerId));
                        setMessage("Card saved successfully.");
                        setIsAddingMethod(false);
                      } finally {
                        setSavingMethod(false);
                      }
                    }}
                  />
                </div>
              )}

              {/* Card list */}
              {methods.length === 0 && !isAddingMethod && (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <CreditCard className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-500">No cards saved yet</p>
                  <p className="mt-0.5 text-xs text-slate-400">Add a card to speed up checkout.</p>
                </div>
              )}

              <div className="space-y-3">
                {methods.map((method) => (
                  <CardRow
                    key={method.id}
                    method={method}
                    working={workingMethodId === method.id}
                    onSetDefault={() => handleSetDefault(method.id)}
                    onToggle={() => handleToggle(method)}
                  />
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </RequireAuth>
  );
}