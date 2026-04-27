"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/journal", label: "Journal" },
  { href: "/dashboard/voice", label: "Voice Analysis" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/settings", label: "Settings" }
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-30 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs md:hidden dark:border-slate-700 dark:bg-slate-900"
        onClick={() => setOpen((prev) => !prev)}
      >
        Menu
      </button>

      <aside
        className={[
          "fixed left-0 top-0 z-20 h-screen w-64 border-r border-slate-200 bg-white p-5 transition-transform dark:border-slate-800 dark:bg-slate-950 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        ].join(" ")}
      >
        <div className="mb-8 pt-12 md:pt-0">
          <h1 className="text-lg font-bold">MindScope</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mental health insights
          </p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={[
                  "block rounded-md px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
