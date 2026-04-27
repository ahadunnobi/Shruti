import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!(audioFile instanceof File)) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    const whisperForm = new FormData();
    whisperForm.append("file", audioFile, audioFile.name || "voice.webm");
    whisperForm.append("model", "whisper-1");

    const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openAiApiKey}`
      },
      body: whisperForm
    });

    if (!whisperResponse.ok) {
      const details = await whisperResponse.text();
      return NextResponse.json(
        { error: "Whisper transcription failed", details },
        { status: 502 }
      );
    }

    const whisperPayload = (await whisperResponse.json()) as { text?: string };
    const transcript = String(whisperPayload.text ?? "").trim();

    let vocalStressScore: number | null = null;
    if (env.vocalToneApiUrl) {
      const toneForm = new FormData();
      toneForm.append("file", audioFile, audioFile.name || "voice.webm");
      const toneResponse = await fetch(env.vocalToneApiUrl, {
        method: "POST",
        body: toneForm
      });

      if (toneResponse.ok) {
        const tonePayload = (await toneResponse.json()) as { stress_score?: number };
        if (typeof tonePayload.stress_score === "number") {
          vocalStressScore = tonePayload.stress_score;
        }
      }
    }

    const savedVoice = await prisma.voiceEntry.create({
      data: {
        userId: session.user.id,
        audioUrl: audioFile.name || "voice.webm",
        transcriptText: transcript || null,
        vocalStressScore
      }
    });

    return NextResponse.json({
      transcript,
      vocalStressScore,
      voiceEntryId: savedVoice.id
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to analyze voice",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
