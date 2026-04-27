import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import type { ReactNode } from "react";

export default function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="md:ml-64">
        <TopNav />
        <main className="p-4 pt-6 md:p-6">{children}</main>
      </div>
    </div>
  );
}
