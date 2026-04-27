import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { MentalHealthScoreCard } from "@/components/dashboard/mental-health-score-card";
import { LifestyleForm } from "@/components/dashboard/lifestyle-form";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRollingAverages } from "@/lib/dashboard-metrics";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(now.getDate() - 6);
  currentStart.setHours(0, 0, 0, 0);

  const previousStart = new Date(currentStart);
  previousStart.setDate(currentStart.getDate() - 7);
  const previousEnd = new Date(currentStart);
  previousEnd.setMilliseconds(previousEnd.getMilliseconds() - 1);

  const [currentWeek, previousWeek, latest] = await Promise.all([
    prisma.analysisResult.findMany({
      where: { userId: session.user.id, createdAt: { gte: currentStart } },
      select: { createdAt: true, category: true, emotionScores: true }
    }),
    prisma.analysisResult.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: previousStart, lte: previousEnd }
      },
      select: { createdAt: true, category: true, emotionScores: true }
    }),
    prisma.analysisResult.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const currentAvg = getRollingAverages(currentWeek);
  const previousAvg = getRollingAverages(previousWeek);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold">Latest analysis</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {latest
            ? `Most recent category: ${latest.category} (${new Date(latest.createdAt).toLocaleString()})`
            : "No analysis yet. Submit your first journal entry."}
        </p>
      </article>

      <MentalHealthScoreCard current={currentAvg} previous={previousAvg} />

      <LifestyleForm initialTip="Add lifestyle factors to generate a weekly correlation tip." />
    </section>
  );
}
