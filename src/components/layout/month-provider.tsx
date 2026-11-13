"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { defaultDemoMonth, getDemoSnapshot, type DemoMonthSnapshot } from "@/constants/demo";
import type { MonthId } from "@/types/month";

type MonthContextValue = {
  monthId: MonthId;
  setMonthId: (monthId: MonthId) => void;
  snapshot: DemoMonthSnapshot;
};

const MonthContext = createContext<MonthContextValue | null>(null);

export function MonthProvider({ children }: { children: ReactNode }) {
  const [monthId, setMonthId] = useState<MonthId>(defaultDemoMonth);
  const snapshot = getDemoSnapshot(monthId);

  return (
    <MonthContext.Provider value={{ monthId, setMonthId, snapshot }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const value = useContext(MonthContext);

  if (!value) {
    throw new Error("useMonth must be used within MonthProvider.");
  }

  return value;
}
