"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";

import { useFinanceSnapshot } from "@/components/layout/finance-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { surfaceClassName } from "@/components/shared/surface";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { cn } from "@/lib/utils";

export function TransactionsView() {
  const snapshot = useFinanceSnapshot();
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  const transactions = useMemo(
    () =>
      (snapshot?.transactions ?? []).filter((transaction) => {
        if (!normalized) {
          return true;
        }
        return (
          transaction.title.toLocaleLowerCase("pt-BR").includes(normalized) ||
          transaction.category.toLocaleLowerCase("pt-BR").includes(normalized)
        );
      }),
    [normalized, snapshot],
  );

  if (!snapshot) {
    return null;
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-1.5 text-sm font-medium text-foreground">
        Buscar
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nome ou categoria"
          className="h-11 rounded-2xl border border-input bg-card px-3 text-base font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </label>
      {transactions.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhuma movimentação"
          description="Não há movimentações com esse termo. Limpe a busca para ver a lista do mês."
        />
      ) : (
        <section className={cn(surfaceClassName, "px-4 sm:px-5")}>
          <div className="divide-y divide-border/80">
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
