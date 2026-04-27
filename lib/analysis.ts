export type EmotionScores = Record<string, number>;

const crisisKeywords = [
  "suicide",
  "kill myself",
  "end my life",
  "self harm",
  "self-harm",
  "harm myself",
  "don't want to live",
  "want to die",
  "overdose",
  "cut myself"
];

export function detectCrisis(text: string): { crisis: boolean; matched: string[] } {
  const normalized = text.toLowerCase();
  const matched = crisisKeywords.filter((keyword) => normalized.includes(keyword));
  return {
    crisis: matched.length > 0,
    matched
  };
}

function getScore(scores: EmotionScores, key: string): number {
  return Number(scores[key] ?? 0);
}

export function calculateCategoryScores(scores: EmotionScores) {
  const sadness = getScore(scores, "sadness");
  const fear = getScore(scores, "fear");
  const anger = getScore(scores, "anger");
  const joy = getScore(scores, "joy");
  const neutral = getScore(scores, "neutral");

  // Weighted heuristic categories to map emotion model output to app-level labels.
  const depressionScore = sadness * 0.7 + fear * 0.2 + (1 - joy) * 0.1;
  const anxietyScore = fear * 0.65 + sadness * 0.2 + neutral * 0.15;
  const stressScore = anger * 0.6 + fear * 0.3 + sadness * 0.1;

  return {
    Depression: depressionScore,
    Anxiety: anxietyScore,
    Stress: stressScore,
    Joy: joy,
    Neutral: neutral
  } as const;
}

export function mapEmotionScoresToCategory(
  scores: EmotionScores
): "Depression" | "Anxiety" | "Stress" | "Neutral" {
  const categoryScores = calculateCategoryScores(scores);

  const topCategory = Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0];
  const [name, score] = topCategory;

  if (score < 0.35 || categoryScores.Joy > 0.5) {
    return "Neutral";
  }

  if (name === "Joy" || name === "Neutral") {
    return "Neutral";
  }

  return name as "Depression" | "Anxiety" | "Stress" | "Neutral";
}
