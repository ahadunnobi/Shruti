import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WeeklyMoodTrendChart } from "@/components/charts/weekly-mood-trend-chart";
import { buildWeeklyMoodTrend } from "@/lib/dashboard-metrics";

type HistoryPageProps = {
  searchParams: {
    from?: string;
    to?: string;
    category?: string;
  };
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const fromDate = searchParams.from ? new Date(searchParams.from) : undefined;
  const toDate = searchParams.to ? new Date(searchParams.to) : undefined;
  if (toDate) {
    toDate.setHours(23, 59, 59, 999);
  }
  const categoryFilter = searchParams.category?.trim();

  const results = await prisma.analysisResult.findMany({
    where: {
      userId: session.user.id,
      ...(categoryFilter ? { category: categoryFilter } : {}),
      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {})
            }
          }
        : {})
    },
    orderBy: { createdAt: "desc" }
  });

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);
  const weeklyResults = await prisma.analysisResult.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: weekAgo }
    },
    select: { createdAt: true, category: true, emotionScores: true }
  });
  const trend = buildWeeklyMoodTrend(weeklyResults);

  return (
    <section className="space-y-4">
      <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold">History timeline</h1>
        <form className="mt-4 grid gap-3 md:grid-cols-4" method="GET">
          <input
            type="date"
            name="from"
            defaultValue={searchParams.from ?? ""}
            className="rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
          />
          <input
            type="date"
            name="to"
            defaultValue={searchParams.to ?? ""}
            className="rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
          />
          <select
            name="category"
            defaultValue={searchParams.category ?? ""}
            className="rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
          >
            <option value="">All categories</option>
            <option value="Depression">Depression</option>
            <option value="Anxiety">Anxiety</option>
            <option value="Stress">Stress</option>
            <option value="Neutral">Neutral</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            Apply filters
          </button>
        </form>
      </article>

      <WeeklyMoodTrendChart
        labels={trend.labels}
        depression={trend.depression}
        anxiety={trend.anxiety}
        stress={trend.stress}
      />

      <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold">Entries</h2>
        <div className="mt-4 space-y-3">
          {results.length ? (
            results.map((entry) => (
              <div
                key={entry.id}
                className="rounded-md border border-slate-200 p-3 dark:border-slate-700"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
                    {entry.category}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-slate-700 dark:text-slate-200">
                  {entry.inputText}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              No history results for selected filters.
            </p>
          )}
        </div>
      </article>
    </section>
  );
}
