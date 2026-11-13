"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatMonth } from "@/lib/formatters";
import { loadCategorySpending } from "@/services/finance-actions";
import type { Category } from "@/types/category";
import type { CategorySpendingMonth } from "@/types/category-spending";
import { LineChart } from "lucide-react";

type CategoryHistorySheetProps = {
  category: Category;
  onOpenChange: (open: boolean) => void;
};

export function CategoryHistorySheet({ category, onOpenChange }: CategoryHistorySheetProps) {
  const [rows, setRows] = useState<CategorySpendingMonth[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    loadCategorySpending(category.id).then((result) => {
      if (cancelled) {
        return;
      }

      if (result.ok) {
        setRows(result.data);
        setError("");
        return;
      }

      setError(result.message);
    });

    return () => {
      cancelled = true;
    };
  }, [category.id]);

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] overflow-y-auto rounded-t-3xl px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:mx-auto sm:max-w-lg"
      >
        <SheetHeader className="px-0">
          <SheetTitle>Gastos de {category.name}</SheetTitle>
          <SheetDescription>Valores gravados em cada mês que tem orçamento.</SheetDescription>
        </SheetHeader>
        {error ? (
          <div className="grid gap-3 pb-4">
            <p className="text-sm text-danger-ink">{error}</p>
            <Button type="button" className="h-11 rounded-full" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : null}
        {rows && rows.length === 0 ? (
          <div className="pb-4">
            <EmptyState
              icon={LineChart}
              title="Sem gastos ainda"
              description="Esta categoria ainda não tem valor destinado nem gasto nos meses salvos."
            />
          </div>
        ) : null}
        {rows && rows.length > 0 ? (
          <ul className="divide-y divide-border/80 pb-4">
            {rows.map((row) => (
              <li key={row.monthId} className="grid gap-1 py-3">
                <p className="text-sm font-medium text-foreground">{formatMonth(row.monthId)}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  Orçamento {formatCurrency(row.allocatedCents)} · Gasto {formatCurrency(row.spentCents)}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
        {!rows && !error ? <p className="pb-6 text-sm text-muted-foreground">Carregando o histórico</p> : null}
      </SheetContent>
    </Sheet>
  );
}
