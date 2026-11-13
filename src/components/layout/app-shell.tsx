"use client";

import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { FinanceProvider, useFinance } from "@/components/layout/finance-provider";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { QuickExpenseProvider } from "@/components/layout/quick-expense";
import { DataErrorState } from "@/components/shared/data-error-state";
import { LoadingState } from "@/components/shared/loading-state";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <FinanceProvider>
      <QuickExpenseProvider>
        <div className="min-h-dvh overflow-x-clip bg-background bg-[radial-gradient(1000px_circle_at_0%_-10%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_42%),radial-gradient(800px_circle_at_100%_0%,color-mix(in_srgb,var(--info)_16%,transparent),transparent_36%)] text-foreground">
          <div className="md:grid md:grid-cols-[4.75rem_minmax(0,1fr)] lg:grid-cols-[15.5rem_minmax(0,1fr)]">
            <AppSidebar />
            <div className="min-w-0">
              <AppHeader />
              <FinanceMain>{children}</FinanceMain>
            </div>
          </div>
          <MobileNavigation />
        </div>
      </QuickExpenseProvider>
    </FinanceProvider>
  );
}

function FinanceMain({ children }: { children: ReactNode }) {
  const { status, snapshot, errorMessage, retry } = useFinance();

  return (
    <main
      aria-busy={status === "loading"}
      className="mx-auto w-full max-w-6xl px-4 pt-4 pb-[calc(7rem+env(safe-area-inset-bottom))] md:px-6 md:pt-6 md:pb-10 lg:px-8"
    >
      {status === "loading" && snapshot ? (
        <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">
          Atualizando o mês
        </p>
      ) : null}
      {status === "error" && snapshot && errorMessage ? (
        <p className="mb-3 text-sm text-danger-ink" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {!snapshot && status === "error" && errorMessage ? (
        <DataErrorState message={errorMessage} onRetry={retry} />
      ) : null}
      {!snapshot && status !== "error" ? <LoadingState label="Carregando os dados" /> : null}
      {children}
    </main>
  );
}
