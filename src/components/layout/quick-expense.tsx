"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { useFinance } from "@/components/layout/finance-provider";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { toDateOnly } from "@/lib/formatters";

type QuickExpenseContextValue = {
  openExpense: () => void;
};

const QuickExpenseContext = createContext<QuickExpenseContextValue | null>(null);

export function useQuickExpense() {
  const value = useContext(QuickExpenseContext);

  if (!value) {
    throw new Error("useQuickExpense must be used within QuickExpenseProvider.");
  }

  return value;
}

export function QuickExpenseProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const { retry } = useFinance();

  return (
    <QuickExpenseContext.Provider
      value={{
        openExpense: () => {
          setDate(toDateOnly());
          setOpen(true);
        },
      }}
    >
      {children}
      {open ? (
        <TransactionForm
          mode="expense"
          defaultDate={date}
          onOpenChange={setOpen}
          onSaved={() => retry()}
        />
      ) : null}
    </QuickExpenseContext.Provider>
  );
}
