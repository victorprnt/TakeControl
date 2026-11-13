"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { loadFinanceSnapshot } from "@/services/load-finance";
import type { FinanceSnapshot } from "@/types/finance-snapshot";
import type { MonthId } from "@/types/month";

type FinanceStatus = "loading" | "ready" | "error";

type FinanceContextValue = {
  status: FinanceStatus;
  snapshot: FinanceSnapshot | null;
  errorMessage: string | null;
  selectMonth: (monthId: MonthId) => void;
  retry: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [monthId, setMonthId] = useState<MonthId | undefined>(undefined);
  const [requestId, setRequestId] = useState(0);
  const [snapshot, setSnapshot] = useState<FinanceSnapshot | null>(null);
  const [status, setStatus] = useState<FinanceStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadFinanceSnapshot(monthId).then((result) => {
      if (cancelled) {
        return;
      }

      if (result.ok) {
        setSnapshot(result.snapshot);
        setStatus("ready");
        setErrorMessage(null);
        return;
      }

      setStatus("error");
      setErrorMessage(result.message);
    });

    return () => {
      cancelled = true;
    };
  }, [monthId, requestId]);

  return (
    <FinanceContext.Provider
      value={{
        status,
        snapshot,
        errorMessage,
        selectMonth: (next) => {
          setStatus("loading");
          setMonthId(next);
        },
        retry: () => {
          setStatus("loading");
          setRequestId((current) => current + 1);
        },
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const value = useContext(FinanceContext);

  if (!value) {
    throw new Error("useFinance must be used within FinanceProvider.");
  }

  return value;
}

export function useFinanceSnapshot(): FinanceSnapshot | null {
  return useFinance().snapshot;
}
