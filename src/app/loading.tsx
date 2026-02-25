export default function GlobalLoading() {
  return (
    <section className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <article key={index} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
            <div className="h-36 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
          </article>
        ))}
      </div>
    </section>
  );
}
