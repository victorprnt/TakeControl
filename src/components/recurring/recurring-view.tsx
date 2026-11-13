"use client";

import { useEffect, useState } from "react";
import { Plus, Repeat } from "lucide-react";

import { useFinance, useFinanceSnapshot } from "@/components/layout/finance-provider";
import { RecurringForm } from "@/components/recurring/recurring-form";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { surfaceClassName } from "@/components/shared/surface";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateOnly, formatFrequency, formatMonth, toDateOnly } from "@/lib/formatters";
import {
  generateMonthOccurrences,
  loadCategories,
  loadOccurrencePreview,
  loadRecurringExpenses,
  updateRecurringExpense,
} from "@/services/finance-actions";
import type { Category } from "@/types/category";
import type { RecurringOccurrence } from "@/types/recurring-occurrence";
import type { RecurringExpense } from "@/types/recurring-expense";
import { cn } from "@/lib/utils";

export function RecurringView() {
  const snapshot = useFinanceSnapshot();
  const { retry } = useFinance();
  const [rules, setRules] = useState<RecurringExpense[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [occurrences, setOccurrences] = useState<RecurringOccurrence[]>([]);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [requestId, setRequestId] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<RecurringExpense | null>(null);
  const [createDate, setCreateDate] = useState("");
  const [pendingId, setPendingId] = useState("");
  const monthId = snapshot?.monthId;

  useEffect(() => {
    if (!monthId) {
      return;
    }

    let cancelled = false;

    Promise.all([loadRecurringExpenses(), loadCategories(), loadOccurrencePreview(monthId)]).then(
      ([loadedRules, loadedCategories, loadedOccurrences]) => {
        if (cancelled) {
          return;
        }

        if (!loadedRules.ok) {
          setLoadError(loadedRules.message);
          return;
        }

        if (!loadedCategories.ok) {
          setLoadError(loadedCategories.message);
          return;
        }

        if (!loadedOccurrences.ok) {
          setLoadError(loadedOccurrences.message);
          return;
        }

        setRules(loadedRules.data);
        setCategories(loadedCategories.data);
        setOccurrences(loadedOccurrences.data);
        setLoadError("");
      },
    );

    return () => {
      cancelled = true;
    };
  }, [monthId, requestId]);

  function refresh() {
    setRequestId((current) => current + 1);
    retry();
  }

  async function generate(ruleId?: string) {
    if (!monthId) {
      return;
    }

    setPendingId(ruleId ?? "all");
    setNotice("");
    const result = await generateMonthOccurrences(monthId, ruleId);
    setPendingId("");

    if (!result.ok) {
      setLoadError(result.message);
      return;
    }

    const skipped = result.data.skipped.length;
    setNotice(
      `${result.data.created} lançamento(s) criado(s). ${result.data.alreadyPosted} período(s) já existiam.${
        skipped ? ` ${skipped} não puderam ser lançados.` : ""
      }`,
    );
    refresh();
  }

  if (!snapshot || !monthId) {
    return null;
  }

  const names = new Map(categories.map((category) => [category.id, category.name]));
  const ordered = [...(rules ?? [])].sort((left, right) => {
    if (left.isActive !== right.isActive) {
      return left.isActive ? -1 : 1;
    }

    return left.description.localeCompare(right.description, "pt-BR");
  });

  return (
    <div className="grid gap-4">
      <section className={cn(surfaceClassName, "grid gap-3 p-4 sm:p-5")}>
        <p className="text-sm leading-6 text-muted-foreground">
          Cada regra guarda como a conta se repete. Lançar o mês cria a transação daquele período uma única vez.
          Editar esse lançamento mantém as próximas na regra. Um gasto registrado à mão continua separado.
        </p>
        <Button
          type="button"
          className="h-11 rounded-full sm:w-fit"
          onClick={() => {
            setCreateDate(toDateOnly());
            setCreating(true);
          }}
        >
          <Plus />
          Nova recorrência
        </Button>
      </section>
      {notice ? (
        <p role="status" className="rounded-[1.4rem] bg-primary/15 px-4 py-3 text-sm leading-6 text-foreground">
          {notice}
        </p>
      ) : null}
      {loadError ? <p className="text-sm text-danger-ink">{loadError}</p> : null}
      {rules === null && !loadError ? <LoadingState label="Carregando as recorrências" /> : null}
      {rules && ordered.length === 0 ? (
        <EmptyState icon={Repeat} title="Nenhuma recorrência" description="Cadastre uma conta que se repete." />
      ) : null}
      {ordered.length > 0 ? (
        <section className="grid gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-foreground">Regras</h2>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full"
              disabled={pendingId === "all"}
              onClick={() => void generate()}
            >
              {pendingId === "all" ? "Lançando" : `Lançar pendentes de ${formatMonth(monthId)}`}
            </Button>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {ordered.map((rule) => (
              <article key={rule.id} className={cn(surfaceClassName, "grid gap-3 p-4 sm:p-5")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-foreground">{rule.description}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {names.get(rule.categoryId) ?? "Sem categoria"} · {formatFrequency(rule.frequency)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-danger-ink">
                    {formatCurrency(rule.amount)}
                  </p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {rule.isActive ? "Ativa" : "Inativa"} · desde {formatDateOnly(rule.startDate)}
                  {rule.endDate ? ` até ${formatDateOnly(rule.endDate)}` : ""}
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Button type="button" variant="outline" className="h-11 rounded-full" onClick={() => setEditing(rule)}>
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-full"
                    onClick={() => {
                      void updateRecurringExpense(rule.id, { isActive: !rule.isActive }).then((result) => {
                        if (!result.ok) {
                          setLoadError(result.message);
                          return;
                        }

                        refresh();
                      });
                    }}
                  >
                    {rule.isActive ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    type="button"
                    className="h-11 rounded-full"
                    disabled={!rule.isActive || pendingId === rule.id}
                    onClick={() => void generate(rule.id)}
                  >
                    {pendingId === rule.id ? "Lançando" : "Lançar mês"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <section className={cn(surfaceClassName, "p-4 sm:p-5")}>
        <h2 className="text-sm font-semibold text-foreground">Próximas ocorrências</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          De {formatMonth(monthId)} até os dois meses seguintes. Pendente ainda não é uma transação.
        </p>
        {occurrences.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nenhuma ocorrência neste intervalo.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/80">
            {occurrences.map((occurrence) => (
              <li
                key={`${occurrence.recurringExpenseId}-${occurrence.date}`}
                className="flex items-center gap-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{occurrence.description}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {occurrence.categoryName} · {formatDateOnly(occurrence.date)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums text-danger-ink">
                    −{formatCurrency(occurrence.amountCents)}
                  </p>
                  <p className={cn("text-xs", occurrence.status === "posted" ? "text-accent-foreground" : "text-muted-foreground")}>
                    {occurrence.status === "posted" ? "Lançada" : "Pendente"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {creating ? (
        <RecurringForm
          defaultDate={createDate}
          onOpenChange={setCreating}
          onSaved={refresh}
        />
      ) : null}
      {editing ? (
        <RecurringForm
          key={editing.id}
          expense={editing}
          defaultDate={editing.startDate}
          onOpenChange={(open) => {
            if (!open) {
              setEditing(null);
            }
          }}
          onSaved={refresh}
        />
      ) : null}
    </div>
  );
}
