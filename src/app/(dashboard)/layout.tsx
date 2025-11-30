import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

// Disable static generation for all dashboard pages
export const dynamic = 'force-dynamic';

// Layout untuk halaman dashboard (WITH sidebar & header)
export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      {/* Main Content */}
      <div
        className={cn(
          "relative flex flex-1 flex-col",
          // Ensure main content takes remaining width
          "min-w-0", // This is crucial for preventing overflow
        )}
      >
        <Header />

        <main className="flex-1 overflow-x-auto overflow-y-auto bg-gray-1 dark:bg-dark-2">
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
