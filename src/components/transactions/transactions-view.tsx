"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, SearchX } from "lucide-react";

import { useFinance, useFinanceSnapshot } from "@/components/layout/finance-provider";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { surfaceClassName } from "@/components/shared/surface";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateOnly, monthDateRange, toDateOnly } from "@/lib/formatters";
import { deleteTransaction, loadCategories, loadTransactions } from "@/services/finance-actions";
import type { Category } from "@/types/category";
import type { Transaction, TransactionType } from "@/types/transaction";
import { cn } from "@/lib/utils";

const fieldClassName =
  "h-11 w-full min-w-0 rounded-2xl border border-input bg-card px-3 text-base font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

type TypeFilter = "all" | TransactionType;
type SortOrder = "desc" | "asc";

export function TransactionsView() {
  const snapshot = useFinanceSnapshot();
  const { retry } = useFinance();
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState("");
  const [requestId, setRequestId] = useState(0);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sort, setSort] = useState<SortOrder>("desc");
  const [range, setRange] = useState<{ scope: string; from: string; to: string } | null>(null);
  const [creating, setCreating] = useState<TransactionType | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [removing, setRemoving] = useState<Transaction | null>(null);
  const [createDate, setCreateDate] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.all([loadTransactions(), loadCategories()]).then(([loadedTransactions, loadedCategories]) => {
      if (cancelled) {
        return;
      }

      if (!loadedTransactions.ok) {
        setLoadError(loadedTransactions.message);
        return;
      }

      if (!loadedCategories.ok) {
        setLoadError(loadedCategories.message);
        return;
      }

      setTransactions(loadedTransactions.data);
      setCategories(loadedCategories.data);
      setLoadError("");
    });

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const monthId = snapshot?.monthId;
  const activeRange = useMemo(() => {
    if (range && (range.scope === "all" || range.scope === monthId)) {
      return range;
    }

    if (!monthId) {
      return null;
    }

    const bounds = monthDateRange(monthId);
    return { scope: monthId, from: bounds.start, to: bounds.end };
  }, [monthId, range]);
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  const visible = useMemo(() => {
    const source = transactions ?? [];

    return source
      .filter((transaction) => {
        if (!activeRange || transaction.date < activeRange.from || transaction.date > activeRange.to) {
          return false;
        }

        if (type !== "all" && transaction.type !== type) {
          return false;
        }

        if (categoryFilter === "none" && transaction.categoryId) {
          return false;
        }

        if (categoryFilter !== "all" && categoryFilter !== "none" && transaction.categoryId !== categoryFilter) {
          return false;
        }

        if (!normalized) {
          return true;
        }

        return transaction.description.toLocaleLowerCase("pt-BR").includes(normalized);
      })
      .sort((left, right) => {
        const order = left.date.localeCompare(right.date) || left.id.localeCompare(right.id);
        return sort === "asc" ? order : -order;
      });
  }, [activeRange, categoryFilter, normalized, sort, transactions, type]);

  function refresh() {
    setRequestId((current) => current + 1);
    retry();
  }

  function openCreate(next: TransactionType) {
    setCreateDate(toDateOnly());
    setCreating(next);
  }

  if (!snapshot || !activeRange) {
    return null;
  }

  const names = new Map(categories.map((category) => [category.id, category.name]));
  const planned = snapshot.incomeCents;
  const received = snapshot.receivedIncomeCents;

  return (
    <div className="grid gap-4">
      <section className={cn(surfaceClassName, "grid gap-2 p-4 sm:p-5")}>
        <p className="text-sm leading-6 text-foreground">
          Renda planejada {formatCurrency(planned)}. Renda recebida {formatCurrency(received)}.
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          Cada receita entra uma vez na renda recebida. Os envelopes continuam usando a renda planejada.
        </p>
      </section>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" className="h-11 rounded-full" onClick={() => openCreate("expense")}>
          <Plus />
          Nova despesa
        </Button>
        <Button type="button" variant="outline" className="h-11 rounded-full" onClick={() => openCreate("income")}>
          <Plus />
          Nova receita
        </Button>
      </div>
      <section className={cn(surfaceClassName, "grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4")}>
        <label className="grid gap-1.5 text-sm font-medium text-foreground sm:col-span-2 xl:col-span-1">
          Buscar descrição
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: mercado"
            className={fieldClassName}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-foreground">
          Tipo
          <select value={type} onChange={(event) => setType(event.target.value as TypeFilter)} className={fieldClassName}>
            <option value="all">Todas</option>
            <option value="expense">Despesas</option>
            <option value="income">Receitas</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-foreground">
          Categoria
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={fieldClassName}>
            <option value="all">Todas</option>
            <option value="none">Sem categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-foreground">
          De
          <input
            type="date"
            value={activeRange.from}
            onChange={(event) => setRange({ scope: activeRange.scope, from: event.target.value, to: activeRange.to })}
            className={fieldClassName}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-foreground">
          Até
          <input
            type="date"
            value={activeRange.to}
            onChange={(event) => setRange({ scope: activeRange.scope, from: activeRange.from, to: event.target.value })}
            className={fieldClassName}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-foreground">
          Ordem
          <select value={sort} onChange={(event) => setSort(event.target.value as SortOrder)} className={fieldClassName}>
            <option value="desc">Mais recentes</option>
            <option value="asc">Mais antigas</option>
          </select>
        </label>
        <div className="flex items-end gap-2 sm:col-span-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-full"
            onClick={() => {
              const bounds = monthDateRange(snapshot.monthId);
              setRange({ scope: snapshot.monthId, from: bounds.start, to: bounds.end });
            }}
          >
            Este mês
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-full"
            onClick={() => {
              const dates = (transactions ?? []).map((transaction) => transaction.date).sort();
              setRange({
                scope: "all",
                from: dates[0] ?? "2000-01-01",
                to: dates[dates.length - 1] ?? "2100-12-31",
              });
            }}
          >
            Todo o histórico
          </Button>
        </div>
      </section>
      {loadError ? <p className="text-sm text-danger-ink">{loadError}</p> : null}
      {transactions === null && !loadError ? <LoadingState label="Carregando as movimentações" /> : null}
      {transactions && activeRange.from > activeRange.to ? (
        <EmptyState
          icon={SearchX}
          title="Período inválido"
          description="A data inicial precisa ser anterior ou igual à data final."
        />
      ) : null}
      {transactions && activeRange.from <= activeRange.to && visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhuma movimentação"
          description="Não há lançamentos com esses filtros. Ajuste a busca, o tipo, a categoria ou o período."
        />
      ) : null}
      {visible.length > 0 ? (
        <section className={cn(surfaceClassName, "px-4 sm:px-5")}>
          <div className="divide-y divide-border/80">
            {visible.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={{
                  id: transaction.id,
                  title: transaction.description,
                  category: transaction.categoryId ? (names.get(transaction.categoryId) ?? "Sem categoria") : "Entrada",
                  dateLabel: formatDateOnly(transaction.date),
                  amountCents: transaction.amount,
                  direction: transaction.type === "income" ? "in" : "out",
                }}
                detail={
                  transaction.recurringExpenseId
                    ? "Ocorrência de uma recorrência. Editar este lançamento mantém as próximas na regra."
                    : transaction.notes
                }
                actions={
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 flex-1 rounded-full"
                      onClick={() => setEditing(transaction)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 flex-1 rounded-full text-danger-ink"
                      onClick={() => setRemoving(transaction)}
                    >
                      Excluir
                    </Button>
                  </>
                }
              />
            ))}
          </div>
        </section>
      ) : null}
      {creating ? (
        <TransactionForm
          key={creating}
          mode={creating}
          defaultDate={createDate}
          onOpenChange={(open) => {
            if (!open) {
              setCreating(null);
            }
          }}
          onSaved={refresh}
        />
      ) : null}
      {editing ? (
        <TransactionForm
          key={editing.id}
          mode="edit"
          transaction={editing}
          defaultDate={editing.date}
          onOpenChange={(open) => {
            if (!open) {
              setEditing(null);
            }
          }}
          onSaved={refresh}
        />
      ) : null}
      <ConfirmationDialog
        open={removing !== null}
        title="Excluir esta movimentação?"
        description={
          removing?.recurringExpenseId
            ? "O envelope deixa de contar este valor. Gerar a recorrência de novo pode criar outra vez este período."
            : "O envelope e a renda recebida passam a ser calculados sem este lançamento."
        }
        confirmLabel="Excluir"
        tone="danger"
        onOpenChange={(open) => {
          if (!open) {
            setRemoving(null);
          }
        }}
        onConfirm={() => {
          if (!removing) {
            return;
          }

          const id = removing.id;
          setRemoving(null);
          void deleteTransaction(id).then((result) => {
            if (!result.ok) {
              setLoadError(result.message);
              return;
            }

            refresh();
          });
        }}
      />
    </div>
  );
}
