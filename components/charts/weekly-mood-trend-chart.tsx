"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type WeeklyMoodTrendChartProps = {
  labels: string[];
  depression: number[];
  anxiety: number[];
  stress: number[];
};

export function WeeklyMoodTrendChart({
  labels,
  depression,
  anxiety,
  stress
}: WeeklyMoodTrendChartProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 text-sm font-semibold">Weekly mood trend</h3>
      <Line
        data={{
          labels,
          datasets: [
            { label: "Depression", data: depression, borderColor: "#6366f1", tension: 0.25 },
            { label: "Anxiety", data: anxiety, borderColor: "#f97316", tension: 0.25 },
            { label: "Stress", data: stress, borderColor: "#ef4444", tension: 0.25 }
          ]
        }}
        options={{
          responsive: true,
          plugins: { legend: { position: "bottom" } },
          scales: { y: { min: 0, max: 1 } }
        }}
      />
    </div>
  );
}
