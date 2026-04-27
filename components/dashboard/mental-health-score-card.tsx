type MentalHealthScoreCardProps = {
  current: { Depression: number; Anxiety: number; Stress: number };
  previous: { Depression: number; Anxiety: number; Stress: number };
};

function trendArrow(current: number, previous: number) {
  if (current > previous + 0.02) {
    return "↑";
  }
  if (current < previous - 0.02) {
    return "↓";
  }
  return "→";
}

export function MentalHealthScoreCard({
  current,
  previous
}: MentalHealthScoreCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold">Mental Health Score (7-day average)</h3>
      <div className="mt-4 space-y-2 text-sm">
        <p>Depression: {current.Depression.toFixed(2)} {trendArrow(current.Depression, previous.Depression)}</p>
        <p>Anxiety: {current.Anxiety.toFixed(2)} {trendArrow(current.Anxiety, previous.Anxiety)}</p>
        <p>Stress: {current.Stress.toFixed(2)} {trendArrow(current.Stress, previous.Stress)}</p>
      </div>
    </article>
  );
}
