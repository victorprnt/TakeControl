"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { addFixedBill } from "@/services/finance-actions";
import { parseCurrencyToCents } from "@/lib/formatters";

type BillFormProps = {
  monthId: string;
  onSaved: () => void;
};

export function BillForm({ monthId, onSaved }: BillFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function add(nextName: string, nextAmount: string) {
    const parsed = parseCurrencyToCents(nextAmount);

    if (!nextName.trim()) {
      setError("Informe o nome da conta.");
      return;
    }

    if (parsed === null) {
      setError("Use um valor como 80,00.");
      return;
    }

    setPending(true);
    const result = await addFixedBill(monthId, nextName, parsed);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setName("");
    setAmount("");
    setError("");
    setOpen(false);
    onSaved();
  }

  return (
    <div className="px-1">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">Contas fixas</h2>
          <p className="mt-1 text-sm leading-6 text-white/60">
            Inclua, remova e marque o pagamento de cada conta do mês.
          </p>
        </div>
        <Button
          type="button"
          className="h-11 shrink-0 rounded-full px-4"
          aria-expanded={open}
          onClick={() => {
            setOpen((current) => !current);
            setError("");
          }}
        >
          <Plus />
          Nova conta
        </Button>
      </div>
      {open ? (
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_9.5rem_10rem]"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const nextName = data.get("name");
            const nextAmount = data.get("amount");
            void add(typeof nextName === "string" ? nextName : name, typeof nextAmount === "string" ? nextAmount : amount);
          }}
        >
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
            placeholder="Nome da conta"
            aria-label="Nome da conta"
            disabled={pending}
            className="h-11 w-full min-w-0 rounded-full border-0 bg-white/10 px-4 text-base text-white outline-none placeholder:text-white/40 focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <input
            name="amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            aria-label="Valor da conta"
            disabled={pending}
            className="h-11 w-full min-w-0 rounded-full border-0 bg-white/10 px-4 text-base font-medium text-white tabular-nums outline-none placeholder:text-white/40 focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="submit" className="h-11 w-full rounded-full sm:w-40" disabled={pending}>
            Adicionar
          </Button>
          {error ? <p className="text-sm text-danger-ink sm:col-span-3">{error}</p> : null}
        </form>
      ) : null}
    </div>
  );
}
