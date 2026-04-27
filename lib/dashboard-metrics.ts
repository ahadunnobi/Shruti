import { calculateCategoryScores, EmotionScores } from "@/lib/analysis";

type AnalysisLike = {
  createdAt: Date;
  category: string;
  emotionScores: unknown;
};

export function asEmotionScores(value: unknown): EmotionScores {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const scores: EmotionScores = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    scores[key] = Number(val ?? 0);
  }
  return scores;
}

export function getLast7Dates() {
  const dates: Date[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(now.getDate() - i);
    dates.push(d);
  }
  return dates;
}

export function buildWeeklyMoodTrend(items: AnalysisLike[]) {
  const dates = getLast7Dates();
  const buckets = new Map<string, { Depression: number; Anxiety: number; Stress: number; count: number }>();

  for (const date of dates) {
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, { Depression: 0, Anxiety: 0, Stress: 0, count: 0 });
  }

  for (const item of items) {
    const key = new Date(item.createdAt).toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) {
      continue;
    }
    const emotion = asEmotionScores(item.emotionScores);
    const derived = calculateCategoryScores(emotion);
    bucket.Depression += derived.Depression;
    bucket.Anxiety += derived.Anxiety;
    bucket.Stress += derived.Stress;
    bucket.count += 1;
  }

  const labels = dates.map((d) =>
    d.toLocaleDateString(undefined, { weekday: "short" })
  );

  const depression = dates.map((d) => {
    const b = buckets.get(d.toISOString().slice(0, 10));
    return b && b.count ? Number((b.Depression / b.count).toFixed(3)) : 0;
  });
  const anxiety = dates.map((d) => {
    const b = buckets.get(d.toISOString().slice(0, 10));
    return b && b.count ? Number((b.Anxiety / b.count).toFixed(3)) : 0;
  });
  const stress = dates.map((d) => {
    const b = buckets.get(d.toISOString().slice(0, 10));
    return b && b.count ? Number((b.Stress / b.count).toFixed(3)) : 0;
  });

  return { labels, depression, anxiety, stress };
}

export function getRollingAverages(items: AnalysisLike[]) {
  if (!items.length) {
    return { Depression: 0, Anxiety: 0, Stress: 0 };
  }

  const totals = { Depression: 0, Anxiety: 0, Stress: 0 };
  for (const item of items) {
    const derived = calculateCategoryScores(asEmotionScores(item.emotionScores));
    totals.Depression += derived.Depression;
    totals.Anxiety += derived.Anxiety;
    totals.Stress += derived.Stress;
  }

  return {
    Depression: Number((totals.Depression / items.length).toFixed(3)),
    Anxiety: Number((totals.Anxiety / items.length).toFixed(3)),
    Stress: Number((totals.Stress / items.length).toFixed(3))
  };
}
