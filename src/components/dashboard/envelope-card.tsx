"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Button } from "@/components/ui/button";
import { addEnvelopeSpend } from "@/services/finance-actions";
import { formatCurrency, parseCurrencyToCents } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { EnvelopeStatus } from "@/types/finance-snapshot";

type EnvelopeCardProps = {
  envelope: EnvelopeStatus;
  monthId: string;
  onSaved: () => void;
};

export function EnvelopeCard({ envelope, monthId, onSaved }: EnvelopeCardProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function add(rawAmount: string) {
    const parsed = parseCurrencyToCents(rawAmount);

    if (parsed === null || parsed <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    setPending(true);
    const result = await addEnvelopeSpend(envelope.id, monthId, parsed);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setAmount("");
    setError("");
    setOpen(false);
    onSaved();
  }

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-[1.3rem] bg-white/10 p-3 ring-1 ring-white/10">
      <div className="flex items-center gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-white shadow-[0_0_18px_rgba(143,214,242,0.25)]"
          style={{ backgroundColor: envelope.color }}
        >
          <CategoryIcon name={envelope.icon} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white">{envelope.name}</h3>
          <p className="truncate text-xs text-white/60">Orçamento {formatCurrency(envelope.allocatedCents)}</p>
        </div>
        <Button
          type="button"
          aria-expanded={open}
          aria-label={`Adicionar valor em ${envelope.name}`}
          className="size-11 rounded-full shadow-[0_12px_22px_-14px_rgba(20,80,70,0.95)]"
          onClick={() => {
            setOpen((current) => !current);
            setError("");
          }}
        >
          <Plus />
        </Button>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-white/55">Gasto</dt>
          <dd className="text-sm font-semibold tabular-nums text-white">{formatCurrency(envelope.spentCents)}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/55">Disponível</dt>
          <dd
            className={cn(
              "text-sm font-semibold tabular-nums",
              envelope.availableCents < 0 ? "text-danger-ink" : "text-white",
            )}
          >
            {formatCurrency(envelope.availableCents)}
          </dd>
        </div>
      </dl>
      <ProgressBar value={envelope.consumedPercent} tone={envelope.tone} label={`${envelope.name} utilizado`} />
      {open ? (
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const field = new FormData(event.currentTarget).get("amount");
            void add(typeof field === "string" ? field : amount);
          }}
        >
          <label className="grid gap-1.5 text-sm font-medium text-white">
            Valor
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0,00"
              name="amount"
              aria-label={`Valor para ${envelope.name}`}
              disabled={pending}
              className="h-11 w-full min-w-0 rounded-full border-0 bg-white/10 px-4 text-base text-white outline-none placeholder:text-white/40 focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          {error ? <p className="text-sm text-danger-ink">{error}</p> : null}
          <Button type="submit" className="h-11 rounded-full shadow-[0_12px_22px_-14px_rgba(20,80,70,0.95)]" disabled={pending}>
            {pending ? "Adicionando" : "Adicionar"}
          </Button>
        </form>
      ) : null}
    </article>
  );
}
