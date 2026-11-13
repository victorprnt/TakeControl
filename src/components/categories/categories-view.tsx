"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { CategoryForm } from "@/components/categories/category-form";
import { CategoryHistorySheet } from "@/components/categories/category-history-sheet";
import { CategoryIcon } from "@/components/categories/category-icon";
import { useFinance } from "@/components/layout/finance-provider";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { DataErrorState } from "@/components/shared/data-error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { surfaceClassName } from "@/components/shared/surface";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { loadCategories, updateCategory } from "@/services/finance-actions";
import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";

export function CategoriesView() {
  const { retry: reloadFinance } = useFinance();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState(0);
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [history, setHistory] = useState<Category | null>(null);
  const [deactivate, setDeactivate] = useState<Category | null>(null);
  const [pendingId, setPendingId] = useState("");

  useEffect(() => {
    let cancelled = false;

    loadCategories().then((result) => {
      if (cancelled) {
        return;
      }

      if (result.ok) {
        setCategories(result.data);
        setError("");
        return;
      }

      setError(result.message);
    });

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  function refresh() {
    setRequestId((current) => current + 1);
    reloadFinance();
  }

  async function setActive(category: Category, isActive: boolean) {
    setPendingId(category.id);
    const result = await updateCategory(category.id, { isActive });
    setPendingId("");

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setDeactivate(null);
    refresh();
  }

  if (!categories && error) {
    return <DataErrorState message={error} onRetry={() => setRequestId((current) => current + 1)} />;
  }

  if (!categories) {
    return <LoadingState label="Carregando as categorias" />;
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {categories.filter((category) => category.isActive).length} ativas de {categories.length}.
        </p>
        <Button type="button" className="h-11 rounded-full px-4" onClick={() => setEditing("new")}>
          <Plus />
          Nova categoria
        </Button>
      </div>
      {error ? <p className="text-sm text-danger-ink">{error}</p> : null}
      <section className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <article key={category.id} className={cn(surfaceClassName, "flex min-w-0 flex-col gap-4 p-4", !category.isActive && "opacity-80")}>
            <div className="flex items-center gap-3">
              <span
                className="grid size-12 shrink-0 place-items-center rounded-2xl bg-muted"
                style={{ color: category.color }}
              >
                <CategoryIcon name={category.icon} className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-foreground">{category.name}</h2>
                <p className="text-xs text-muted-foreground">{category.isActive ? "Ativa" : "Inativa"}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  Padrão {formatCurrency(category.defaultBudget)}
                </p>
              </div>
            </div>
            {category.description ? <p className="text-sm leading-6 text-muted-foreground">{category.description}</p> : null}
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" className="h-11 rounded-full" onClick={() => setEditing(category)}>
                Editar
              </Button>
              <Button type="button" variant="outline" className="h-11 rounded-full" onClick={() => setHistory(category)}>
                Histórico
              </Button>
              <Button
                type="button"
                variant="outline"
                className="col-span-2 h-11 rounded-full"
                disabled={pendingId === category.id}
                onClick={() => {
                  if (category.isActive) {
                    setDeactivate(category);
                    return;
                  }
                  void setActive(category, true);
                }}
              >
                {category.isActive ? "Desativar" : "Ativar"}
              </Button>
            </div>
          </article>
        ))}
      </section>
      {editing ? (
        <CategoryForm
          category={editing === "new" ? undefined : editing}
          onOpenChange={(open) => {
            if (!open) {
              setEditing(null);
            }
          }}
          onSaved={refresh}
        />
      ) : null}
      {history ? <CategoryHistorySheet category={history} onOpenChange={(open) => !open && setHistory(null)} /> : null}
      <ConfirmationDialog
        open={Boolean(deactivate)}
        title="Desativar esta categoria?"
        description="Ela sai das sugestões de meses novos. Os orçamentos já salvos continuam no mês em que foram gravados."
        confirmLabel="Desativar"
        tone="danger"
        onOpenChange={(open) => {
          if (!open) {
            setDeactivate(null);
          }
        }}
        onConfirm={() => {
          if (deactivate) {
            void setActive(deactivate, false);
          }
        }}
      />
    </div>
  );
}
