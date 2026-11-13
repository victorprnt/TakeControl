"use client";

import { CalendarCheck } from "lucide-react";

import { useMonth } from "@/components/layout/month-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { surfaceClassName } from "@/components/shared/surface";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { cn } from "@/lib/utils";

export function RecurringView() {
  const { snapshot } = useMonth();

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
      <EmptyState
        icon={CalendarCheck}
        title="Nenhum atraso"
        description="Esta prévia não tem contas vencidas. O acompanhamento real entra com a persistência."
      />
    </div>
  );
}
