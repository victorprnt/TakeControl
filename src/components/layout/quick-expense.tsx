"use client";

import { createContext, useContext, useState, type FormEvent, type ReactNode } from "react";

import { useFinance } from "@/components/layout/finance-provider";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type QuickExpenseContextValue = {
  openExpense: () => void;
};

const QuickExpenseContext = createContext<QuickExpenseContextValue | null>(null);

export function useQuickExpense() {
  const value = useContext(QuickExpenseContext);

  if (!value) {
    throw new Error("useQuickExpense must be used within QuickExpenseProvider.");
  }

  return value;
}

export function QuickExpenseProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");
  const { snapshot } = useFinance();
  const categories = snapshot?.envelopes ?? [];
  const selectedCategoryId = categories.some((category) => category.id === categoryId)
    ? categoryId
    : (categories[0]?.id ?? "");

  function reset() {
    setDescription("");
    setAmount("");
    setCategoryId("");
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!description.trim() || !amount.trim()) {
      setError("Informe a descrição e o valor para continuar.");
      return;
    }

    setError("");
    setConfirmOpen(true);
  }

  return (
    <QuickExpenseContext.Provider value={{ openExpense: () => setOpen(true) }}>
      {children}
      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            reset();
          }
        }}
      >
        <SheetContent
          side="bottom"
          className="max-h-[92dvh] overflow-y-auto rounded-t-3xl px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:mx-auto sm:max-w-lg"
        >
          <SheetHeader className="px-0">
            <SheetTitle>Nova despesa</SheetTitle>
            <SheetDescription>
              Prévia do formulário. Nada é gravado nesta etapa.
            </SheetDescription>
          </SheetHeader>
          <form className="grid gap-4 px-0 pb-2" onSubmit={handleSubmit}>
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              Descrição
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="h-11 rounded-2xl border border-input bg-card px-3 text-base font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                placeholder="Ex.: mercado da semana"
                autoComplete="off"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              Valor
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                className="h-11 rounded-2xl border border-input bg-card px-3 text-base font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                placeholder="0,00"
                autoComplete="off"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              Categoria
              <select
                value={selectedCategoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="h-11 rounded-2xl border border-input bg-card px-3 text-base font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            {error ? <p className="text-sm text-danger-ink">{error}</p> : null}
            <Button type="submit" className="h-11 rounded-full">
              Revisar despesa
            </Button>
          </form>
        </SheetContent>
      </Sheet>
      <ConfirmationDialog
        open={confirmOpen}
        title="Registrar esta prévia?"
        description="O formulário só demonstra a interface. A despesa não entra no orçamento."
        confirmLabel="Entendi"
        onOpenChange={setConfirmOpen}
        onConfirm={() => {
          setConfirmOpen(false);
          setOpen(false);
          reset();
        }}
      />
    </QuickExpenseContext.Provider>
  );
}
