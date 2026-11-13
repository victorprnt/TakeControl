"use client";

import { useEffect, useState } from "react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { fieldClassName } from "@/components/budgets/money-field";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatCurrencyInput, parseCurrencyToCents } from "@/lib/formatters/currency-input";
import { prepareMonthPlan, saveMonthPlan } from "@/services/finance-actions";
import type { MonthId } from "@/types/month";
import type { MonthPlan } from "@/types/month-plan";

type NewMonthSheetProps = {
  initialMonth: MonthId;
  onOpenChange: (open: boolean) => void;
  onSaved: (monthId: MonthId) => void;
};

export function NewMonthSheet({ initialMonth, onOpenChange, onSaved }: NewMonthSheetProps) {
  const [monthId, setMonthId] = useState(initialMonth);
  const [plan, setPlan] = useState<MonthPlan | null>(null);
  const [income, setIncome] = useState("");
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    prepareMonthPlan(monthId).then((result) => {
      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setPlan(result.data);
      setIncome(formatCurrencyInput(result.data.incomeCents));
      setAmounts(
        Object.fromEntries(
          result.data.allocations.map((allocation) => [
            allocation.categoryId,
            formatCurrencyInput(allocation.allocatedCents),
          ]),
        ),
      );
      setError("");
    });

    return () => {
      cancelled = true;
    };
  }, [monthId]);

  async function save() {
    if (!plan) {
      return;
    }

    const incomeCents = parseCurrencyToCents(income);

    if (incomeCents === null) {
      setError("A renda precisa ser um valor como 5.455,00.");
      return;
    }

    const allocations = [];

    for (const allocation of plan.allocations) {
      const allocatedCents = parseCurrencyToCents(amounts[allocation.categoryId] ?? "");

      if (allocatedCents === null) {
        setError(`O valor de ${allocation.name} precisa ser um valor como 800,00.`);
        return;
      }

      allocations.push({ categoryId: allocation.categoryId, allocatedCents });
    }

    setPending(true);
    const result = await saveMonthPlan(plan.monthId, incomeCents, allocations);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onSaved(result.data);
    onOpenChange(false);
  }

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] overflow-y-auto rounded-t-3xl px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:mx-auto sm:max-w-lg"
      >
        <SheetHeader className="px-0">
          <SheetTitle>Orçamento do mês</SheetTitle>
          <SheetDescription>
            {plan?.alreadySaved
              ? "Este mês já está salvo. Salvar de novo atualiza os valores e não cria outro orçamento."
              : "A sugestão copia os envelopes do mês anterior. Despesas não são copiadas."}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 pb-2">
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Mês
            <input
              type="month"
              value={monthId}
              onChange={(event) => {
                setMonthId(event.target.value);
                setPlan(null);
              }}
              className={fieldClassName}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Renda
            <input
              value={income}
              onChange={(event) => setIncome(event.target.value)}
              inputMode="decimal"
              autoComplete="off"
              className={fieldClassName}
            />
          </label>
          <div className="grid gap-3">
            {plan?.allocations.map((allocation) => (
              <label key={allocation.categoryId} className="grid gap-1.5 text-sm font-medium text-foreground">
                <span className="flex items-center gap-2">
                  <CategoryIcon name={allocation.icon} className="size-4" />
                  {allocation.name}
                </span>
                <input
                  value={amounts[allocation.categoryId] ?? ""}
                  onChange={(event) =>
                    setAmounts((current) => ({ ...current, [allocation.categoryId]: event.target.value }))
                  }
                  inputMode="decimal"
                  autoComplete="off"
                  className={fieldClassName}
                />
              </label>
            ))}
          </div>
          {!plan && !error ? <p className="text-sm text-muted-foreground">Carregando a sugestão</p> : null}
          {error ? <p className="text-sm text-danger-ink">{error}</p> : null}
          <Button type="button" className="h-11 rounded-full" onClick={() => void save()} disabled={pending || !plan}>
            {pending ? "Salvando" : "Salvar mês"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
