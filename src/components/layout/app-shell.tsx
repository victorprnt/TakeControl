"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { canvasClassName } from "@/components/layout/canvas";
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
        <div className={cn("min-h-dvh text-foreground", canvasClassName)}>
          <div className="md:grid md:grid-cols-[auto_minmax(0,1fr)]">
            <AppSidebar />
            <div className="min-w-0 overflow-x-clip">
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
