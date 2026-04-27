"use client";

import { useEffect, useState } from "react";

const ONBOARDING_SEEN_KEY = "mh-onboarding-seen";
const CONSENT_GRANTED_KEY = "mh-consent-granted";

export function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(ONBOARDING_SEEN_KEY) === "true";
    if (!hasSeen) {
      setOpen(true);
    }
  }, []);

  const closeWithoutConsent = () => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    localStorage.setItem(CONSENT_GRANTED_KEY, "false");
    setOpen(false);
  };

  const acceptConsent = () => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    localStorage.setItem(CONSENT_GRANTED_KEY, "true");
    setOpen(false);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Welcome to MindScope</h2>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
          This app helps you analyze journal and voice entries to surface emotion
          patterns over time.
        </p>
        <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          This is not a medical diagnosis. Please consult a professional.
        </div>
        <p className="mt-4 text-sm text-slate-700 dark:text-slate-200">
          Do you consent to storing your analysis data for trend tracking?
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={closeWithoutConsent}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={acceptConsent}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            I consent
          </button>
        </div>
      </div>
    </div>
  );
}
