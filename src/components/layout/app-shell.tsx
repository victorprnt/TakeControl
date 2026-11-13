import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { MonthProvider } from "@/components/layout/month-provider";
import { QuickExpenseProvider } from "@/components/layout/quick-expense";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <MonthProvider>
      <QuickExpenseProvider>
        <div className="min-h-dvh overflow-x-clip bg-background bg-[radial-gradient(1000px_circle_at_0%_-10%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_42%),radial-gradient(800px_circle_at_100%_0%,color-mix(in_srgb,var(--info)_16%,transparent),transparent_36%)] text-foreground">
          <div className="md:grid md:grid-cols-[4.75rem_minmax(0,1fr)] lg:grid-cols-[15.5rem_minmax(0,1fr)]">
            <AppSidebar />
            <div className="min-w-0">
              <AppHeader />
              <main className="mx-auto w-full max-w-6xl px-4 pt-4 pb-[calc(7rem+env(safe-area-inset-bottom))] md:px-6 md:pt-6 md:pb-10 lg:px-8">
                {children}
              </main>
            </div>
          </div>
          <MobileNavigation />
        </div>
      </QuickExpenseProvider>
    </MonthProvider>
  );
}
