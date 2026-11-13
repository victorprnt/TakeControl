"use client";

import { useState } from "react";
import { Plus, TriangleAlert } from "lucide-react";

import { MoneyField } from "@/components/budgets/money-field";
import { NewMonthSheet } from "@/components/budgets/new-month-sheet";
import { CategoryCard } from "@/components/categories/category-card";
import { useFinance, useFinanceSnapshot } from "@/components/layout/finance-provider";
import { SummaryCard } from "@/components/shared/summary-card";
import { surfaceClassName } from "@/components/shared/surface";
import { Button } from "@/components/ui/button";
import { formatCurrency, getNextMonth } from "@/lib/formatters";
import { applyReceivedIncome, saveCategoryAllocation, saveMonthIncome } from "@/services/finance-actions";
import { cn } from "@/lib/utils";

export function BudgetsView() {
  const snapshot = useFinanceSnapshot();
  const { retry, selectMonth } = useFinance();
  const [creating, setCreating] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (!snapshot) {
    return null;
  }

  const { distribution } = snapshot;
  const latestMonth = snapshot.months[snapshot.months.length - 1] ?? snapshot.monthId;

  return (
    <div className="grid gap-4">
      {distribution.overIncome ? (
        <p
          role="status"
          className="flex items-start gap-3 rounded-[1.4rem] bg-destructive/15 px-4 py-3 text-sm leading-6 text-danger-ink"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            A distribuição passou da renda em {formatCurrency(-distribution.unallocatedCents)}. Os envelopes
            continuam editáveis.
          </span>
        </p>
      ) : null}
      {saveError ? <p className="text-sm text-danger-ink">{saveError}</p> : null}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Renda planejada"
          valueCents={distribution.incomeCents}
          hint={
            snapshot.receivedIncomeCents === distribution.incomeCents
              ? "Igual à renda recebida"
              : `Recebida ${formatCurrency(snapshot.receivedIncomeCents)}`
          }
        />
        <SummaryCard label="Total distribuído" valueCents={distribution.allocatedCents} hint="Soma dos envelopes" />
        <SummaryCard
          label="Não distribuído"
          valueCents={distribution.unallocatedCents}
          hint={distribution.overIncome ? "Acima da renda" : "Ainda fora dos envelopes"}
        />
        <article className={cn(surfaceClassName, "flex min-w-0 flex-col gap-3 p-4 sm:p-5")}>
          <p className="text-sm text-muted-foreground">Percentual distribuído</p>
          <p
            className={cn(
              "text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl",
              distribution.overIncome ? "text-danger-ink" : "text-foreground",
            )}
          >
            {distribution.allocatedPercent === null ? "—" : `${distribution.allocatedPercent}%`}
          </p>
          <p className="text-xs leading-5 text-muted-foreground">Parte da renda que já foi para os envelopes</p>
        </article>
      </section>
      <section className={cn(surfaceClassName, "grid gap-3 p-4 sm:p-5")}>
        <div className="grid gap-1">
          <p className="text-sm font-medium text-foreground">
            Renda recebida {formatCurrency(snapshot.receivedIncomeCents)}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Cada receita do mês entra uma vez neste total. Ele fica separado da renda planejada, que é a base dos
            envelopes.
          </p>
        </div>
        {snapshot.receivedIncomeCents === distribution.incomeCents ? (
          <p className="text-sm text-accent-foreground">A renda recebida confere com a planejada.</p>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full sm:w-fit"
            onClick={() => {
              void applyReceivedIncome(snapshot.monthId).then((result) => {
                if (!result.ok) {
                  setSaveError(result.message);
                  return;
                }

                setSaveError("");
                retry();
              });
            }}
          >
            Substituir a planejada pela recebida
          </Button>
        )}
        <MoneyField
          key={`${snapshot.monthId}-income-${distribution.incomeCents}`}
          label="Renda planejada"
          cents={distribution.incomeCents}
          saveLabel="Salvar renda"
          onSave={async (cents) => {
            const result = await saveMonthIncome(snapshot.monthId, cents);
            if (!result.ok) {
              return result.message;
            }
            setSaveError("");
            retry();
            return null;
          }}
        />
      </section>
      <div className="flex justify-stretch sm:justify-end">
        <Button type="button" className="h-11 w-full rounded-full px-4 sm:w-auto" onClick={() => setCreating(true)}>
          <Plus />
          Novo mês
        </Button>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {snapshot.envelopes.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            action={
              <MoneyField
                key={`${snapshot.monthId}-${category.id}-${category.allocatedCents}`}
                label="Alterar orçamento"
                cents={category.allocatedCents}
                onSave={async (cents) => {
                  const result = await saveCategoryAllocation(snapshot.monthId, category.id, cents);
                  if (!result.ok) {
                    return result.message;
                  }
                  setSaveError("");
                  retry();
                  return null;
                }}
              />
            }
          />
        ))}
      </section>
      {creating ? (
        <NewMonthSheet
          initialMonth={getNextMonth(latestMonth)}
          onOpenChange={setCreating}
          onSaved={(monthId) => {
            setSaveError("");
            if (monthId === snapshot.monthId) {
              retry();
              return;
            }
            selectMonth(monthId);
          }}
        />
      ) : null}
    </div>
  );
}
