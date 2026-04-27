import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        Mental Health Analysis Platform
      </h1>
      <p className="max-w-2xl text-slate-600 dark:text-slate-300">
        Analyze journal text and voice entries with privacy-first workflows,
        trend tracking, and crisis flagging support.
      </p>
      <Link
        href="/dashboard"
        className="rounded-md bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
