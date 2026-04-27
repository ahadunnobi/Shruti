import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { detectCrisis, mapEmotionScoresToCategory } from "@/lib/analysis";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const HF_MODEL_URL =
  "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base";

type HfEmotionItem = { label: string; score: number };

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

    const hfResponse = await fetch(HF_MODEL_URL, {
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
          details: errorText
        },
        { status: 502 }
      );
    }

    const modelResult = (await hfResponse.json()) as unknown;
    const emotionScores = normalizeEmotionScores(modelResult);
    const category = mapEmotionScoresToCategory(emotionScores);

    const saved = await prisma.analysisResult.create({
      data: {
        userId: session.user.id,
        inputText,
        emotionScores,
        category
      }
    });

    return NextResponse.json(
      {
        crisis: false,
        category,
        emotionScores,
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
