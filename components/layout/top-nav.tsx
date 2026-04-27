import { ThemeToggle } from "@/components/theme/theme-toggle";

export function TopNav() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:px-6">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
          Welcome back
        </p>
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      <ThemeToggle />
    </header>
  );
}
