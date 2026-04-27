"use client";

import { useState } from "react";
import { ResultCard } from "@/components/analysis/result-card";
import { VoiceRecorder } from "@/components/voice/voice-recorder";

type VoiceResponse = {
  transcript: string;
  vocalStressScore: number | null;
  error?: string;
};

type TextResponse = {
  crisis: boolean;
  category?: "Depression" | "Anxiety" | "Stress" | "Neutral";
  emotionScores?: Record<string, number>;
  error?: string;
  matchedKeywords?: string[];
};

function showDiscrepancyAlert(category: TextResponse["category"], stressScore: number | null) {
  if (typeof stressScore !== "number") {
    return false;
  }
  const textIsPositive = category === "Neutral";
  return textIsPositive && stressScore >= 0.65;
}

export default function VoiceAnalysisPage() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [stressScore, setStressScore] = useState<number | null>(null);
  const [textResult, setTextResult] = useState<TextResponse | null>(null);

  const analyzeVoice = async () => {
    if (!audioBlob) {
      setError("Record audio before running analysis.");
      return;
    }

    setLoading(true);
    setError(null);
    setTextResult(null);

    try {
      const voiceForm = new FormData();
      voiceForm.append("audio", audioBlob, "entry.webm");

      // Prompt 16 chain step 1: transcribe + tone analysis via /api/analyze/voice.
      const voiceResponse = await fetch("/api/analyze/voice", {
        method: "POST",
        body: voiceForm
      });
      const voicePayload = (await voiceResponse.json()) as VoiceResponse;
      if (!voiceResponse.ok) {
        throw new Error(voicePayload.error ?? "Voice analysis failed");
      }

      setTranscript(voicePayload.transcript);
      setStressScore(voicePayload.vocalStressScore);

      // Prompt 16 chain step 2: pipe transcript into existing /api/analyze/text.
      const textResponse = await fetch("/api/analyze/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: voicePayload.transcript })
      });
      const textPayload = (await textResponse.json()) as TextResponse;
      if (!textResponse.ok) {
        throw new Error(textPayload.error ?? "Text analysis failed");
      }

      setTextResult(textPayload);
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Unable to complete voice workflow."
      );
    } finally {
      setLoading(false);
    }
  };

  const shouldShowDiscrepancy = showDiscrepancyAlert(textResult?.category, stressScore);

  return (
    <section className="space-y-4">
      <VoiceRecorder onAudioReady={setAudioBlob} />

      <button
        type="button"
        onClick={analyzeVoice}
        disabled={loading}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
      >
        {loading ? "Analyzing..." : "Analyze Voice"}
      </button>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {transcript ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold">Transcript</p>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{transcript}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Vocal stress score:{" "}
            {typeof stressScore === "number" ? stressScore.toFixed(2) : "not available"}
          </p>
        </div>
      ) : null}

      {textResult?.crisis ? (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
          Crisis language detected from transcript. Show emergency resources now.
          {textResult.matchedKeywords?.length ? (
            <p className="mt-2 text-xs">Keywords: {textResult.matchedKeywords.join(", ")}</p>
          ) : null}
        </div>
      ) : null}

      {textResult && !textResult.crisis && textResult.category && textResult.emotionScores ? (
        <ResultCard category={textResult.category} emotionScores={textResult.emotionScores} />
      ) : null}

      {shouldShowDiscrepancy ? (
        <div className="rounded-md border border-yellow-400 bg-yellow-50 p-4 text-sm text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-100">
          Your voice suggests you may be feeling more stressed than your words indicate.
        </div>
      ) : null}
    </section>
  );
}
