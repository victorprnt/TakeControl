"use client";

import { useFinanceSnapshot } from "@/components/layout/finance-provider";
import { surfaceClassName } from "@/components/shared/surface";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { cn } from "@/lib/utils";

export function RecurringView() {
  const snapshot = useFinanceSnapshot();

  if (!snapshot) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
      <section className={cn(surfaceClassName, "px-4 sm:px-5")}>
        <h2 className="pt-4 text-sm font-semibold text-foreground">Contas que se repetem</h2>
        <div className="divide-y divide-border/80">
          {snapshot.recurring.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </section>
      <section className={cn(surfaceClassName, "p-5")}>
        <h2 className="text-sm font-semibold text-foreground">Ativas</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {snapshot.recurring.length} despesas recorrentes ativas. Os lançamentos do mês ficam em Transações.
        </p>
      </section>
    </div>
  );
}
