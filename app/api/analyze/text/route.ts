import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { detectCrisis, mapEmotionScoresToCategory } from "@/lib/analysis";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

// ── Model URL resolution ──────────────────────────────────────────────────────
// Priority:  CUSTOM_HF_MODEL_URL  (fine-tuned Inference Endpoint, Prompt 25)
//            → DEFAULT_HF_MODEL_URL (public emotion model, Prompt 7)
const DEFAULT_HF_MODEL_URL =
  "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base";

function getModelUrl(): { url: string; isCustom: boolean } {
  const custom = env.customHfModelUrl.trim();
  if (custom) {
    return { url: custom, isCustom: true };
  }
  return { url: DEFAULT_HF_MODEL_URL, isCustom: false };
}

// ── Response-shape helpers ────────────────────────────────────────────────────
type HfEmotionItem = { label: string; score: number };

/**
 * Default model returns a nested array: [[{label, score}, …]]
 * Flatten it into { emotionLabel: score } for the existing pipeline.
 */
function normalizeEmotionScores(payload: unknown): Record<string, number> {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    return {};
  }
  const rows = payload[0] as HfEmotionItem[];
  const scores: Record<string, number> = {};
  for (const row of rows) {
    scores[row.label.toLowerCase()] = Number(row.score ?? 0);
  }
  return scores;
}

/**
 * Custom fine-tuned model (text-classification task) returns a flat array:
 * [{label: "Depression", score: 0.87}, …]
 *
 * We map our 5 class-labels → emotion names so the rest of the pipeline
 * (charts, DB schema, frontend) stays unchanged.
 */
const CUSTOM_LABEL_TO_EMOTION: Record<string, string> = {
  Depression: "sadness",
  Anxiety:    "fear",
  PTSD:       "fear",
  Stress:     "disgust",
  Neutral:    "neutral",
};

function normalizeCustomScores(
  payload: unknown
): { emotionScores: Record<string, number>; category: string } {
  const flat = Array.isArray(payload) ? (payload as HfEmotionItem[]) : [];
  const emotionScores: Record<string, number> = {};

  let topLabel = "Neutral";
  let topScore = 0;

  for (const item of flat) {
    const emotion =
      CUSTOM_LABEL_TO_EMOTION[item.label] ?? item.label.toLowerCase();
    emotionScores[emotion] = Number(item.score ?? 0);
    if (item.score > topScore) {
      topScore = item.score;
      topLabel = item.label;
    }
  }

  return { emotionScores, category: topLabel };
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const inputText = String(body?.text ?? "").trim();

    if (!inputText) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // ── Crisis gate ──────────────────────────────────────────────────────────
    const crisisCheck = detectCrisis(inputText);
    if (crisisCheck.crisis) {
      return NextResponse.json(
        {
          crisis: true,
          matchedKeywords: crisisCheck.matched,
          message:
            "Crisis keywords detected. Please show helpline resources immediately."
        },
        { status: 200 }
      );
    }

    // ── Call Hugging Face (custom endpoint or default) ───────────────────────
    const { url: modelUrl, isCustom } = getModelUrl();

    const hfResponse = await fetch(modelUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.huggingFaceApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: inputText })
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      return NextResponse.json(
        {
          error: "Hugging Face inference failed",
          details: errorText,
          modelUsed: isCustom ? "custom" : "default"
        },
        { status: 502 }
      );
    }

    const modelResult = (await hfResponse.json()) as unknown;

    // ── Normalize output based on which model responded ──────────────────────
    let emotionScores: Record<string, number>;
    let category: string;

    if (isCustom) {
      const normalized = normalizeCustomScores(modelResult);
      emotionScores = normalized.emotionScores;
      category      = normalized.category;
    } else {
      emotionScores = normalizeEmotionScores(modelResult);
      category      = mapEmotionScoresToCategory(emotionScores);
    }

    // ── Persist to database (inputText encrypted with AES-256-GCM) ───────────
    const saved = await prisma.analysisResult.create({
      data: {
        userId: session.user.id,
        inputText: encrypt(inputText),   // Prompt 26: stored encrypted
        emotionScores,
        category
      }
    });

    return NextResponse.json(
      {
        crisis: false,
        category,
        emotionScores,
        modelUsed: isCustom ? "custom-fine-tuned" : "default",
        result: {
          id: saved.id,
          timestamp: saved.createdAt
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to analyze text",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
