"use client";

import { useState } from "react";
import { PiggyBank, Receipt, WalletCards, type LucideIcon } from "lucide-react";

import { BillCard } from "@/components/dashboard/bill-card";
import { BillForm } from "@/components/dashboard/bill-form";
import { EnvelopeCard } from "@/components/dashboard/envelope-card";
import { useFinance, useFinanceSnapshot } from "@/components/layout/finance-provider";
import { surfaceClassName } from "@/components/shared/surface";
import { BILLS_CATEGORY_ID } from "@/constants/finance";
import { formatCurrency, formatCurrencyInput, parseCurrencyToCents } from "@/lib/formatters";
import { saveMonthIncome, saveMonthSaved } from "@/services/finance-actions";
import { cn } from "@/lib/utils";
import type { Cents } from "@/types/money";

export function DashboardView() {
  const snapshot = useFinanceSnapshot();
  const { retry } = useFinance();

  if (!snapshot) {
    return null;
  }

  const envelopes = snapshot.envelopes.filter((envelope) => envelope.id !== BILLS_CATEGORY_ID);
  const { overview } = snapshot;

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid min-w-0 gap-4">
        <section className={cn(surfaceClassName, "p-5 sm:p-7")} aria-label="Resumo do mês">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/70">Saldo</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-white tabular-nums sm:text-6xl">
                {formatCurrency(overview.balanceCents)}
              </p>
              <p className="mt-3 text-sm text-white/60">Orçamento menos o gasto</p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
                <MonthAmountField
                  key={`${snapshot.monthId}-salary-${overview.salaryCents}`}
                  label="Salário"
                  cents={overview.salaryCents}
                  onSave={async (cents) => {
                    const result = await saveMonthIncome(snapshot.monthId, cents);
                    if (!result.ok) {
                      return result.message;
                    }
                    retry();
                    return null;
                  }}
                />
                <MonthAmountField
                  key={`${snapshot.monthId}-saved-${overview.savedCents}`}
                  label="Economizado"
                  cents={overview.savedCents}
                  onSave={async (cents) => {
                    const result = await saveMonthSaved(snapshot.monthId, cents);
                    if (!result.ok) {
                      return result.message;
                    }
                    retry();
                    return null;
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:min-w-[22rem]">
              <Orb
                label="Orçamento"
                valueCents={overview.budgetCents}
                icon={WalletCards}
                glow="shadow-[0_0_28px_rgba(143,214,242,0.4)] ring-white/40"
              />
              <Orb
                label="Gastos"
                valueCents={overview.spentCents}
                icon={Receipt}
                glow="shadow-[0_0_28px_rgba(240,160,168,0.38)] ring-rose-100/40"
              />
              <Orb
                label="Economizado"
                valueCents={overview.savedCents}
                icon={PiggyBank}
                glow="shadow-[0_0_28px_rgba(125,222,200,0.4)] ring-white/40"
              />
            </div>
          </div>
        </section>

        <section className={cn(surfaceClassName, "p-4 sm:p-6")}>
          <BillForm monthId={snapshot.monthId} onSaved={retry} />
          {snapshot.bills.length === 0 ? (
            <p className="px-1 py-8 text-center text-sm text-white/60">Nenhuma conta fixa neste mês.</p>
          ) : (
            <div className="mt-2 divide-y divide-white/10">
              {snapshot.bills.map((bill) => (
                <BillCard key={bill.id} bill={bill} onSaved={retry} />
              ))}
            </div>
          )}
        </section>
      </div>

      <section className={cn(surfaceClassName, "p-4 sm:p-5")}>
        <div className="px-1">
          <h2 className="text-lg font-semibold tracking-tight text-white">Envelopes</h2>
          <p className="mt-1 text-sm leading-6 text-white/60">Orçamento, gasto e o que ainda pode ser usado.</p>
        </div>
        {envelopes.length === 0 ? (
          <p className="px-1 py-8 text-center text-sm text-white/60">Nenhum envelope neste mês.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {envelopes.map((envelope) => (
              <EnvelopeCard key={envelope.id} envelope={envelope} monthId={snapshot.monthId} onSaved={retry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MonthAmountField({
  label,
  cents,
  onSave,
}: {
  label: string;
  cents: Cents;
  onSave: (cents: Cents) => Promise<string | null>;
}) {
  const [value, setValue] = useState(() => formatCurrencyInput(cents));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function save(raw: string) {
    const parsed = parseCurrencyToCents(raw);

    if (parsed === null) {
      setError("Use um valor como 5.455,00.");
      return;
    }

    setValue(formatCurrencyInput(parsed));

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
    <label className="grid gap-1.5 text-sm font-medium text-white/70">
      {label}
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={(event) => void save(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void save(event.currentTarget.value);
          }
        }}
        inputMode="decimal"
        autoComplete="off"
        aria-label={label}
        disabled={pending}
        className="h-11 w-full rounded-full border-0 bg-white/10 px-4 text-base font-medium text-white tabular-nums outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <span className="min-h-5 text-xs text-danger-ink">{error}</span>
    </label>
  );
}

function Orb({
  label,
  valueCents,
  icon: Icon,
  glow,
}: {
  label: string;
  valueCents: Cents;
  icon: LucideIcon;
  glow: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-full bg-white/10 text-white ring-1 sm:size-[4.5rem]",
          glow,
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="max-w-full text-xs font-semibold text-white tabular-nums sm:text-sm">{formatCurrency(valueCents)}</p>
      <p className="text-[11px] text-white/60">{label}</p>
    </div>
  );
}
