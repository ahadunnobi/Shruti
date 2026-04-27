"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { DisclaimerBanner } from "@/components/analysis/disclaimer-banner";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type ResultCardProps = {
  category: "Depression" | "Anxiety" | "Stress" | "Neutral";
  emotionScores: Record<string, number>;
};

const badgeTone: Record<ResultCardProps["category"], string> = {
  Depression:
    "bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-100 dark:border-indigo-900",
  Anxiety:
    "bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950/50 dark:text-orange-100 dark:border-orange-900",
  Stress:
    "bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/50 dark:text-rose-100 dark:border-rose-900",
  Neutral:
    "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-100 dark:border-emerald-900"
};

export function ResultCard({ category, emotionScores }: ResultCardProps) {
  const labels = Object.keys(emotionScores);
  const values = labels.map((label) => Number(emotionScores[label] ?? 0));

  const data = {
    labels,
    datasets: [
      {
        label: "Emotion score",
        data: values,
        backgroundColor: "#475569"
      }
    ]
  };

  return (
    <article className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Analysis result</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeTone[category]}`}>
          {category}
        </span>
      </div>

      <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
        <Bar
          data={data}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { min: 0, max: 1 } }
          }}
        />
      </div>

      <DisclaimerBanner />
    </article>
  );
}
