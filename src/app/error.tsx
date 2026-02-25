"use client";

import Link from "next/link";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Something went wrong</p>
      <h1 className="mt-2 text-2xl font-semibold text-red-900">We could not load this page</h1>
      <p className="mt-2 text-sm text-red-800">
        {error.message || "An unexpected error occurred. Please retry or return to the catalog."}
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Try again
        </button>
        <Link href="/" className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-800 hover:bg-red-100">
          Back to home
        </Link>
      </div>
    </section>
  );
}
