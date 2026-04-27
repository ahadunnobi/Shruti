"use client";

import { useEffect, useMemo, useState } from "react";
import { ResultCard } from "@/components/analysis/result-card";

const DRAFT_KEY = "journal-draft-text";
const CONSENT_GRANTED_KEY = "mh-consent-granted";

type AnalyzeResponse = {
  crisis: boolean;
  category?: "Depression" | "Anxiety" | "Stress" | "Neutral";
  emotionScores?: Record<string, number>;
  matchedKeywords?: string[];
  message?: string;
  error?: string;
};

export default function JournalPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      setText(draft);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(DRAFT_KEY, text);
      setLastAutoSavedAt(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [text]);

  const lastSavedText = useMemo(() => {
    if (!lastAutoSavedAt) {
      return "Not autosaved yet";
    }
    return `Autosaved at ${lastAutoSavedAt.toLocaleTimeString()}`;
  }, [lastAutoSavedAt]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Please write a journal entry first.");
      return;
    }
    if (localStorage.getItem(CONSENT_GRANTED_KEY) !== "true") {
      setError("Please complete onboarding consent before saving analysis data.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      const payload = (await response.json()) as AnalyzeResponse;
      if (!response.ok) {
        throw new Error(payload.error ?? "Analysis failed");
      }

      setResult(payload);
      localStorage.setItem(DRAFT_KEY, text);
      setLastAutoSavedAt(new Date());
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while analyzing text."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h1 className="text-lg font-semibold">Journal</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Write how you are feeling. Drafts autosave every 30 seconds.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="How are you feeling today?"
        rows={10}
        className="w-full rounded-md border border-slate-300 bg-transparent p-3 text-sm outline-none ring-slate-400 focus:ring-2 dark:border-slate-700"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {loading ? "Analyzing..." : "Analyze Journal"}
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-400">{lastSavedText}</p>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {result && !result.crisis && result.category && result.emotionScores ? (
        <ResultCard category={result.category} emotionScores={result.emotionScores} />
      ) : null}

      {result?.crisis ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-red-600">Immediate support</h2>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
              Your message includes language that may indicate crisis. Please contact
              emergency support now.
            </p>
            <ul className="mt-3 list-inside list-disc text-sm text-slate-700 dark:text-slate-200">
              <li>988 Suicide & Crisis Lifeline (US): Call or text 988</li>
              <li>Emergency services: Dial your local emergency number</li>
              <li>Reach out to a trusted person near you right now</li>
            </ul>
            {result.matchedKeywords?.length ? (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Triggered terms: {result.matchedKeywords.join(", ")}
              </p>
            ) : null}
            <button
              type="button"
              className="mt-4 rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"
              onClick={() => setResult(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
