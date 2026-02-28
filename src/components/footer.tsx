"use client";

import { useAuth } from "@/contexts/auth-context";
import { Headset, Heart, ShieldCheck, ShoppingBasket, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const year = new Date().getFullYear();

export function Footer() {
  const { user, hasAdminRole, logout } = useAuth();
  const router = useRouter();
  const isLoggedIn = Boolean(user);

  return (
    <footer className="mt-16 bg-slate-950 text-slate-300">

      {/* ── Trust strip ── */}
      <div className="border-y border-white/10 bg-slate-900/60">
        <div className="mx-auto grid max-w-[1500px] gap-3 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
              <Truck className="h-4 w-4 text-emerald-400" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Fast Delivery</p>
              <p className="text-xs text-slate-400">Nationwide, fully tracked</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15">
              <ShieldCheck className="h-4 w-4 text-rose-400" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Safe & Secure</p>
              <p className="text-xs text-slate-400">Your payment is always protected</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
              <Headset className="h-4 w-4 text-amber-400" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">We're Here for You</p>
              <p className="text-xs text-slate-400">Support every day of the week</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div className="mx-auto grid max-w-[1500px] gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">

        {/* Brand column */}
        <div className="space-y-4 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 shadow-lg shadow-rose-500/30">
              <ShoppingBasket className="h-4 w-4 text-white" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              StreetLux<span className="text-rose-400">City</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-slate-400">
            South Africa's favourite place to shop. Great prices, real brands, and delivery you can count on.
          </p>
          <p className="text-sm text-slate-500">
            📧{" "}
            <a href="mailto:support@streetluxcity.co.za" className="text-slate-300 hover:text-rose-400 transition-colors">
              support@streetluxcity.co.za
            </a>
          </p>
        </div>

        {/* Shop links */}
        <div>
          <h4 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Shop</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/products"   className="hover:text-white hover:translate-x-1 inline-block transition-all">All Products</Link></li>
            <li><Link href="/categories" className="hover:text-white hover:translate-x-1 inline-block transition-all">Browse Categories</Link></li>
            {isLoggedIn && (
              <>
                <li><Link href="/cart"   className="hover:text-white hover:translate-x-1 inline-block transition-all">My Cart</Link></li>
                <li><Link href="/orders" className="hover:text-white hover:translate-x-1 inline-block transition-all">My Orders</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Account links */}
        <div>
          <h4 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">My Account</h4>
          <ul className="space-y-3 text-sm">
            {isLoggedIn ? (
              <>
                <li><Link href="/profile" className="hover:text-white hover:translate-x-1 inline-block transition-all">Profile</Link></li>
                {hasAdminRole && (
                  <li><Link href="/admin" className="hover:text-rose-400 hover:translate-x-1 inline-block transition-all">Admin Panel</Link></li>
                )}
                <li>
                  <button
                    onClick={() => { logout(); router.push("/"); }}
                    className="hover:text-white hover:translate-x-1 inline-block transition-all text-left"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link href="/login"    className="hover:text-white hover:translate-x-1 inline-block transition-all">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white hover:translate-x-1 inline-block transition-all">Create a Free Account</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Help / contact */}
        <div>
          <h4 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Need Help?</h4>
          <ul className="space-y-3 text-sm">
            <li className="text-slate-400">Questions about your order? We've got you covered.</li>
            <li>
              <a href="mailto:support@streetluxcity.co.za" className="text-rose-400 hover:text-rose-300 transition-colors font-medium">
                Contact Support →
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-slate-500 sm:px-6 lg:px-8">
          <p>© {year} StreetLuxCity. All rights reserved.</p>
          <p className="inline-flex items-center gap-1">
            Made with <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> in South Africa
          </p>
        </div>
      </div>
    </footer>
  );
}