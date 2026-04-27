"use client";

import { useState } from "react";

type LifestyleFormProps = {
  initialTip: string;
};

export function LifestyleForm({ initialTip }: LifestyleFormProps) {
  const [sleepHours, setSleepHours] = useState(7);
  const [physicalActivity, setPhysicalActivity] = useState(5);
  const [socialInteractions, setSocialInteractions] = useState(5);
  const [tip, setTip] = useState(initialTip);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/lifestyle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sleepHours, physicalActivity, socialInteractions })
      });
      const payload = (await response.json()) as { tip?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save lifestyle data");
      }
      setTip(payload.tip ?? "Lifestyle data saved.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold">Lifestyle input</h3>
      <div className="mt-3 space-y-4 text-sm">
        <label className="block">
          <span>Sleep hours: {sleepHours.toFixed(1)}</span>
          <input
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={sleepHours}
            onChange={(event) => setSleepHours(Number(event.target.value))}
            className="mt-2 w-full"
          />
        </label>
        <label className="block">
          <span>Physical activity (1-10): {physicalActivity}</span>
          <input
            type="range"
            min={1}
            max={10}
            value={physicalActivity}
            onChange={(event) => setPhysicalActivity(Number(event.target.value))}
            className="mt-2 w-full"
          />
        </label>
        <label className="block">
          <span>Social interactions (1-10): {socialInteractions}</span>
          <input
            type="range"
            min={1}
            max={10}
            value={socialInteractions}
            onChange={(event) => setSocialInteractions(Number(event.target.value))}
            className="mt-2 w-full"
          />
        </label>
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={submit}
        className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
      >
        {saving ? "Saving..." : "Save lifestyle"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
      <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        {tip}
      </p>
    </article>
  );
}
