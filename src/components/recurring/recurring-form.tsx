"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatCurrencyInput, parseCurrencyToCents } from "@/lib/formatters";
import { loadCategories, saveRecurringExpense, updateRecurringExpense } from "@/services/finance-actions";
import type { Category } from "@/types/category";
import type { RecurringExpense, RecurringFrequency } from "@/types/recurring-expense";
import { cn } from "@/lib/utils";

const fieldClassName =
  "h-11 w-full rounded-2xl border border-input bg-card px-3 text-base font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

const panelClassName =
  "max-h-[92dvh] overflow-y-auto rounded-t-3xl px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:!inset-x-auto md:!bottom-auto md:!top-1/2 md:!left-1/2 md:!h-auto md:!w-[min(100%-1.5rem,32rem)] md:!-translate-x-1/2 md:!-translate-y-1/2 md:!rounded-3xl md:!border-0";

type RecurringFormProps = {
  expense?: RecurringExpense;
  defaultDate: string;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function RecurringForm({ expense, defaultDate, onOpenChange, onSaved }: RecurringFormProps) {
  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(expense ? formatCurrencyInput(expense.amount) : "");
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? "");
  const [frequency, setFrequency] = useState<RecurringFrequency>(expense?.frequency ?? "monthly");
  const [startDate, setStartDate] = useState(expense?.startDate ?? defaultDate);
  const [endDate, setEndDate] = useState(expense?.endDate ?? "");
  const [isActive, setIsActive] = useState(expense?.isActive ?? true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const choices = categories.filter((category) => category.isActive || category.id === expense?.categoryId);

  useEffect(() => {
    let cancelled = false;

    loadCategories().then((result) => {
      if (cancelled) {
        return;
      }

      if (result.ok) {
        setCategories(result.data);
        return;
      }

      setError(result.message);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseCurrencyToCents(amount);

    if (!description.trim()) {
      setError("A descrição é obrigatória.");
      return;
    }

    if (parsed === null || parsed <= 0) {
      setError("O valor precisa ser maior que zero.");
      return;
    }

    if (!categoryId) {
      setError("Escolha uma categoria.");
      return;
    }

    if (!startDate) {
      setError("Informe a data inicial.");
      return;
    }

    if (endDate && endDate < startDate) {
      setError("A data final não pode ser anterior à data inicial.");
      return;
    }

    setPending(true);
    const input = {
      description,
      amount: parsed,
      categoryId,
      frequency,
      startDate,
      endDate: endDate || null,
      isActive,
    };
    const result = expense
      ? await updateRecurringExpense(expense.id, input)
      : await saveRecurringExpense({ ...input, endDate: endDate || undefined });
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onSaved();
    onOpenChange(false);
  }

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className={panelClassName}>
        <SheetHeader className="px-0">
          <SheetTitle>{expense ? "Editar recorrência" : "Nova recorrência"}</SheetTitle>
          <SheetDescription>
            A regra gera lançamentos quando você pede. Abrir o mês não cria a mesma ocorrência duas vezes.
          </SheetDescription>
        </SheetHeader>
        <form className="grid gap-4 px-0 pb-2" onSubmit={submit}>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Descrição
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={fieldClassName}
              placeholder="Ex.: aluguel"
              autoComplete="off"
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Valor
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              className={fieldClassName}
              placeholder="0,00"
              autoComplete="off"
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Categoria
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className={fieldClassName}
              required
            >
              <option value="">Escolha</option>
              {choices.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.isActive ? "" : " (inativa)"}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Frequência
            <select
              value={frequency}
              onChange={(event) => setFrequency(event.target.value as RecurringFrequency)}
              className={fieldClassName}
            >
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Data inicial
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className={fieldClassName}
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Data final
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className={fieldClassName}
            />
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            className="flex h-12 items-center justify-between rounded-2xl bg-muted px-4 text-sm font-medium text-foreground"
            onClick={() => setIsActive((current) => !current)}
          >
            Recorrência ativa
            <span className={cn("text-xs", isActive ? "text-accent-foreground" : "text-muted-foreground")}>
              {isActive ? "Sim" : "Não"}
            </span>
          </button>
          {error ? <p className="text-sm text-danger-ink">{error}</p> : null}
          <Button type="submit" className="h-11 rounded-full" disabled={pending}>
            {pending ? "Salvando" : "Salvar recorrência"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
