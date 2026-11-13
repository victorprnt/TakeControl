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
import { loadCategories, saveTransaction, updateTransaction } from "@/services/finance-actions";
import type { Category } from "@/types/category";
import type { Transaction, TransactionType } from "@/types/transaction";

const fieldClassName =
  "h-11 w-full rounded-2xl border border-input bg-card px-3 text-base font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

const panelClassName =
  "max-h-[92dvh] overflow-y-auto rounded-t-3xl px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:!inset-x-auto md:!bottom-auto md:!top-1/2 md:!left-1/2 md:!h-auto md:!w-[min(100%-1.5rem,32rem)] md:!-translate-x-1/2 md:!-translate-y-1/2 md:!rounded-3xl md:!border-0";

type TransactionFormProps = {
  mode: "expense" | "income" | "edit";
  transaction?: Transaction;
  defaultDate: string;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function TransactionForm({ mode, transaction, defaultDate, onOpenChange, onSaved }: TransactionFormProps) {
  const lockedExpense = Boolean(transaction?.recurringExpenseId);
  const initialType: TransactionType = mode === "income" ? "income" : (transaction?.type ?? "expense");
  const [type, setType] = useState<TransactionType>(lockedExpense ? "expense" : initialType);
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [amount, setAmount] = useState(transaction ? formatCurrencyInput(transaction.amount) : "");
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? "");
  const [date, setDate] = useState(transaction?.date ?? defaultDate);
  const [notes, setNotes] = useState(transaction?.notes ?? "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const expense = type === "expense";
  const choices = categories.filter((category) => category.isActive || category.id === transaction?.categoryId);

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

    if (!date) {
      setError("Informe a data.");
      return;
    }

    if (expense && !categoryId) {
      setError("Escolha uma categoria.");
      return;
    }

    setPending(true);
    const input = {
      description,
      amount: parsed,
      type,
      categoryId: expense ? categoryId : categoryId || null,
      date,
      notes: notes.trim() || null,
    };
    const result = transaction
      ? await updateTransaction(transaction.id, input)
      : await saveTransaction(input);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onSaved();
    onOpenChange(false);
  }

  const title = transaction ? "Editar movimentação" : expense ? "Nova despesa" : "Nova receita";

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className={panelClassName}>
        <SheetHeader className="px-0">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {lockedExpense
              ? "Esta ocorrência pode mudar sem alterar as próximas."
              : expense
                ? "A despesa entra no gasto do envelope da categoria."
                : "A receita entra na renda recebida do mês. A renda planejada continua separada."}
          </SheetDescription>
        </SheetHeader>
        <form className="grid gap-4 px-0 pb-2" onSubmit={submit}>
          {mode === "edit" && !lockedExpense ? (
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              Tipo
              <select
                value={type}
                onChange={(event) => setType(event.target.value as TransactionType)}
                className={fieldClassName}
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
            </label>
          ) : null}
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Descrição
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={fieldClassName}
              placeholder={expense ? "Ex.: mercado da semana" : "Ex.: salário"}
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
              required={expense}
            >
              {expense ? <option value="">Escolha</option> : <option value="">Sem categoria</option>}
              {choices.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.isActive ? "" : " (inativa)"}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Data
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={fieldClassName}
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Observações
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-20 w-full rounded-2xl border border-input bg-card px-3 py-2 text-base font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
              placeholder="Opcional"
            />
          </label>
          {error ? <p className="text-sm text-danger-ink">{error}</p> : null}
          <Button type="submit" className="h-11 rounded-full" disabled={pending}>
            {pending ? "Salvando" : "Salvar"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
