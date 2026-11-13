"use client";

import { useState } from "react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { fieldClassName } from "@/components/budgets/money-field";
import { surfaceClassName } from "@/components/shared/surface";
import { updateFixedBill } from "@/services/finance-actions";
import { formatCurrencyInput, parseCurrencyToCents } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { FixedBill } from "@/types/fixed-bill";

type BillCardProps = {
  bill: FixedBill;
  onSaved: () => void;
};

export function BillCard({ bill, onSaved }: BillCardProps) {
  const [amount, setAmount] = useState(() => formatCurrencyInput(bill.amount));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function saveAmount(nextAmount: string) {
    const parsed = parseCurrencyToCents(nextAmount);

    if (parsed === null) {
      setError("Use um valor como 80,00.");
      return;
    }

    setAmount(formatCurrencyInput(parsed));

    if (parsed === bill.amount) {
      setError("");
      return;
    }

    setPending(true);
    const result = await updateFixedBill(bill.id, { amount: parsed });
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError("");
    onSaved();
  }

  async function togglePaid(paid: boolean) {
    setPending(true);
    const result = await updateFixedBill(bill.id, { paid });
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError("");
    onSaved();
  }

  return (
    <article className={cn(surfaceClassName, "flex min-w-0 flex-col gap-4 p-4", bill.paid && "bg-primary/10")}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl",
            bill.paid ? "bg-primary/20 text-accent-foreground" : "bg-muted text-foreground",
          )}
        >
          <CategoryIcon name={bill.icon} className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">{bill.name}</h3>
          <p className="text-sm text-muted-foreground">{bill.paid ? "Paga neste mês" : "Em aberto"}</p>
        </div>
      </div>
      <label className="grid gap-1.5 text-sm font-medium text-foreground">
        Valor
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          onBlur={(event) => void saveAmount(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void saveAmount(event.currentTarget.value);
            }
          }}
          inputMode="decimal"
          autoComplete="off"
          aria-label={`Valor de ${bill.name}`}
          disabled={pending}
          className={fieldClassName}
        />
      </label>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          checked={bill.paid}
          disabled={pending}
          onChange={(event) => void togglePaid(event.target.checked)}
          className="size-5 accent-[var(--primary)]"
        />
        {bill.paid ? "Paga" : "Marcar como paga"}
      </label>
      {error ? <p className="text-sm text-danger-ink">{error}</p> : null}
    </article>
  );
}
