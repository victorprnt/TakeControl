"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { Button } from "@/components/ui/button";
import { deleteFixedBill, updateFixedBill } from "@/services/finance-actions";
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
  const [confirming, setConfirming] = useState(false);

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
    setConfirming(false);
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

  async function remove() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setPending(true);
    const result = await deleteFixedBill(bill.id);
    setPending(false);

    if (!result.ok) {
      setConfirming(false);
      setError(result.message);
      return;
    }

    onSaved();
  }

  return (
    <article className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_9.5rem_10rem] sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full",
            bill.paid ? "bg-white/15 text-white" : "bg-white/10 text-white/80",
          )}
        >
          <CategoryIcon name={bill.icon} className="size-5" />
        </span>
        <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-white">{bill.name}</h3>
        <Button
          type="button"
          variant={confirming ? "destructive" : "secondary"}
          className="size-11 rounded-full"
          aria-label={confirming ? `Confirmar remoção de ${bill.name}` : `Remover ${bill.name}`}
          disabled={pending}
          onClick={() => void remove()}
        >
          <Trash2 />
        </Button>
      </div>
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
        className="h-11 w-full min-w-0 rounded-full border-0 bg-white/10 px-4 text-base font-medium text-white tabular-nums outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <label
        className={cn(
          "inline-flex h-11 w-40 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap",
          bill.paid ? "bg-info/25 text-white" : "bg-white/10 text-white/70",
        )}
      >
        <input
          type="checkbox"
          checked={bill.paid}
          disabled={pending}
          onChange={(event) => void togglePaid(event.target.checked)}
          className="size-4 accent-[var(--primary)]"
        />
        {bill.paid ? "Paga" : "Em aberto"}
      </label>
      {error ? <p className="text-sm text-danger-ink sm:col-span-3">{error}</p> : null}
    </article>
  );
}
