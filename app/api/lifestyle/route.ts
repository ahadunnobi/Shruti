import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { asEmotionScores } from "@/lib/dashboard-metrics";
import { calculateCategoryScores } from "@/lib/analysis";

function buildCorrelationTip(
  sleepHours: number,
  physicalActivity: number,
  socialInteractions: number,
  weeklyAverages: { Depression: number; Anxiety: number; Stress: number }
) {
  if (sleepHours < 6 && weeklyAverages.Anxiety >= Math.max(weeklyAverages.Depression, weeklyAverages.Stress)) {
    return "Low sleep is linked to your high anxiety score this week.";
  }
  if (physicalActivity <= 3 && weeklyAverages.Stress >= weeklyAverages.Anxiety) {
    return "Lower physical activity may be contributing to your elevated stress trend.";
  }
  if (socialInteractions <= 3 && weeklyAverages.Depression >= weeklyAverages.Anxiety) {
    return "Low social interaction may be associated with higher depressive signals this week.";
  }
  return "Your lifestyle metrics look relatively balanced against this week's mood trend.";
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const sleepHours = Number(body?.sleepHours);
    const physicalActivity = Number(body?.physicalActivity);
    const socialInteractions = Number(body?.socialInteractions);

    if (
      Number.isNaN(sleepHours) ||
      Number.isNaN(physicalActivity) ||
      Number.isNaN(socialInteractions)
    ) {
      return NextResponse.json({ error: "Invalid lifestyle values" }, { status: 400 });
    }

    await prisma.lifestyleEntry.create({
      data: {
        userId: session.user.id,
        sleepHours,
        physicalActivity: Math.round(physicalActivity),
        socialInteractions: Math.round(socialInteractions)
      }
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyAnalysis = await prisma.analysisResult.findMany({
      where: { userId: session.user.id, createdAt: { gte: weekAgo } },
      select: { emotionScores: true }
    });

    const totals = { Depression: 0, Anxiety: 0, Stress: 0 };
    for (const item of weeklyAnalysis) {
      const score = calculateCategoryScores(asEmotionScores(item.emotionScores));
      totals.Depression += score.Depression;
      totals.Anxiety += score.Anxiety;
      totals.Stress += score.Stress;
    }
    const divisor = Math.max(weeklyAnalysis.length, 1);
    const averages = {
      Depression: totals.Depression / divisor,
      Anxiety: totals.Anxiety / divisor,
      Stress: totals.Stress / divisor
    };

    const tip = buildCorrelationTip(
      sleepHours,
      Math.round(physicalActivity),
      Math.round(socialInteractions),
      averages
    );

    return NextResponse.json({ success: true, tip });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to save lifestyle data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
