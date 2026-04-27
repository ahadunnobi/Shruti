"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

const LOCALES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "bn", label: "বাংলা",   flag: "🇧🇩" }
] as const;

export function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(locale: string) {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language switcher">
      {LOCALES.map(({ code, label, flag }) => (
        <button
          key={code}
          id={`lang-${code}`}
          disabled={isPending}
          onClick={() => switchLocale(code)}
          title={label}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-slate-800"
        >
          <span>{flag}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
