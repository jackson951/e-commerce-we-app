"use client";

import { useAuth } from "@/contexts/auth-context";
import { getFirstValidationError, registerSchema } from "@/lib/validation";
import { ArrowRight, Eye, EyeOff, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse({
      fullName: form.fullName,
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
    });
    if (!parsed.success) {
      setError(getFirstValidationError(parsed.error));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(parsed.data);
      router.push("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">

      {/* Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 shadow-lg shadow-rose-500/25">
            <ShoppingBasket className="h-4 w-4 text-white" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            StreetLux<span className="text-rose-500">City</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Join thousands of happy shoppers across South Africa.</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={onSubmit} className="space-y-4">

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input
                className={inputClass}
                placeholder="Jane Doe"
                required
                value={form.fullName}
                onChange={update("fullName")}
              />
            </Field>
            <Field label="Email address">
              <input
                className={inputClass}
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={update("email")}
              />
            </Field>
          </div>

          <Field label="Password">
            <div className="relative">
              <input
                className={inputClass + " pr-11"}
                placeholder="At least 8 characters"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password}
                onChange={update("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone number" hint="optional">
              <input
                className={inputClass}
                placeholder="+27 82 123 4567"
                autoComplete="tel"
                value={form.phone}
                onChange={update("phone")}
              />
            </Field>
            <Field label="Delivery address" hint="optional">
              <input
                className={inputClass}
                placeholder="Cape Town, South Africa"
                value={form.address}
                onChange={update("address")}
              />
            </Field>
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating your account…
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-rose-500 hover:text-rose-600 transition-colors">
            Sign in
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline hover:text-slate-600">Terms</Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
      </p>
    </div>
  );
}