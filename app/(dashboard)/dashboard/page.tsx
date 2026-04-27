export default function DashboardPage() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold">Latest analysis</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          No analysis yet. Submit your first journal entry.
        </p>
      </article>
      <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold">Weekly trend</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Trend visualizations will appear here.
        </p>
      </article>
      <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold">Crisis safety</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Crisis keyword detection status and resources.
        </p>
      </article>
    </section>
  );
}
