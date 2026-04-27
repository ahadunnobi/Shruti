"use client";

import { useState } from "react";

export default function PrivacySettingsPage() {
  const [saveVoice, setSaveVoice] = useState(true);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  function flash(text: string, type: "success" | "error" = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  // ── Toggle voice recordings ────────────────────────────────────────────────
  async function handleVoiceToggle(value: boolean) {
    setVoiceLoading(true);
    try {
      const res = await fetch("/api/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saveVoiceRecordings: value })
      });
      if (!res.ok) throw new Error("Failed to update preference");
      setSaveVoice(value);
      flash(`Voice recordings will ${value ? "now be" : "no longer be"} saved.`);
    } catch {
      flash("Could not update preference. Please try again.", "error");
    } finally {
      setVoiceLoading(false);
    }
  }

  // ── Export all data ────────────────────────────────────────────────────────
  async function handleExport() {
    setExportLoading(true);
    try {
      const res = await fetch("/api/privacy");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `shruti-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      flash("Export downloaded successfully.");
    } catch {
      flash("Export failed. Please try again.", "error");
    } finally {
      setExportLoading(false);
    }
  }

  // ── Delete all data ────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/privacy", { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      // Hard redirect — session is now invalid
      window.location.href = "/auth/signin?deleted=true";
    } catch {
      flash("Could not delete your data. Please try again.", "error");
      setDeleteLoading(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* ── Header ── */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Privacy Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage how your data is stored and control what you share with Shruti.
        </p>
      </header>

      {/* ── Flash message ── */}
      {message && (
        <div
          role="alert"
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ── Section: Voice Recordings ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Voice Recordings</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              When enabled, audio files from your voice analysis sessions are
              retained. Disable this to stop saving new recordings immediately.
            </p>
          </div>

          {/* Toggle switch */}
          <button
            id="voice-recording-toggle"
            role="switch"
            aria-checked={saveVoice}
            disabled={voiceLoading}
            onClick={() => handleVoiceToggle(!saveVoice)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 ${
              saveVoice ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 translate-x-0 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                saveVoice ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>

      {/* ── Section: Export ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold">Export Your Data</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Download a full copy of your analysis history, voice entries, and
          lifestyle data as a JSON file.
        </p>
        <button
          id="export-data-btn"
          onClick={handleExport}
          disabled={exportLoading}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {exportLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Exporting…
            </>
          ) : (
            "⬇ Export as JSON"
          )}
        </button>
      </section>

      {/* ── Section: Delete Account ── */}
      <section className="rounded-xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/40 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-red-700 dark:text-red-400">
          Delete All Data
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Permanently delete your account and all associated data — analysis
          history, voice entries, and lifestyle logs. This action{" "}
          <strong>cannot be undone</strong>.
        </p>

        {confirmDelete && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
            ⚠ Are you sure? This will permanently erase your account and all
            data. Click the button again to confirm.
          </p>
        )}

        <button
          id="delete-all-data-btn"
          onClick={handleDelete}
          disabled={deleteLoading}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {deleteLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Deleting…
            </>
          ) : confirmDelete ? (
            "⚠ Confirm — delete everything"
          ) : (
            "🗑 Delete all my data"
          )}
        </button>
      </section>
    </div>
  );
}
