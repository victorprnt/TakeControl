"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatCurrencyInput, parseCurrencyToCents } from "@/lib/formatters/currency-input";
import type { Cents } from "@/types/money";

const fieldClassName =
  "h-11 w-full min-w-0 rounded-2xl border border-input bg-card px-3 text-base font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

type MoneyFieldProps = {
  label: string;
  cents: Cents;
  saveLabel?: string;
  onSave: (cents: Cents) => Promise<string | null>;
};

export function MoneyField({ label, cents, saveLabel = "Salvar", onSave }: MoneyFieldProps) {
  const [value, setValue] = useState(() => formatCurrencyInput(cents));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function save() {
    const parsed = parseCurrencyToCents(value);

    if (parsed === null) {
      setError("Use um valor como 800,00.");
      return;
    }

    if (parsed === cents) {
      setError("");
      return;
    }

    setPending(true);
    const message = await onSave(parsed);
    setPending(false);
    setError(message ?? "");
  }

  return (
    <div className="grid gap-1.5">
      <label className="grid gap-1.5 text-sm font-medium text-foreground">
        {label}
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          inputMode="decimal"
          autoComplete="off"
          className={fieldClassName}
        />
      </label>
      {error ? <p className="text-sm text-danger-ink">{error}</p> : null}
      <Button type="button" className="h-11 rounded-full" onClick={() => void save()} disabled={pending}>
        {pending ? "Salvando" : saveLabel}
      </Button>
    </div>
  );
}

export { fieldClassName };
