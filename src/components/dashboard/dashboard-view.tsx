"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Receipt, Scale, Wallet, WalletCards } from "lucide-react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { ChartCard } from "@/components/charts/chart-card";
import { DailyFlowChart } from "@/components/charts/daily-flow-chart";
import { DistributionChart } from "@/components/charts/distribution-chart";
import { useFinanceSnapshot } from "@/components/layout/finance-provider";
import { ProgressBar } from "@/components/shared/progress-bar";
import { SummaryCard } from "@/components/shared/summary-card";
import { surfaceClassName } from "@/components/shared/surface";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { formatCurrency, formatMonth } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Cents } from "@/types/money";
import type { EnvelopeStatus, ProgressTone } from "@/types/finance-snapshot";

const toneLabel: Record<ProgressTone, string> = {
  safe: "Dentro do orçamento",
  warning: "Atenção",
  danger: "Crítico",
};

const toneClassName: Record<ProgressTone, string> = {
  safe: "bg-primary/15 text-accent-foreground",
  warning: "bg-warning/40 text-foreground",
  danger: "bg-destructive/15 text-danger-ink",
};

export function DashboardView() {
  const snapshot = useFinanceSnapshot();
  const [pickedId, setPickedId] = useState<string | null>(null);

  if (!snapshot) {
    return null;
  }

  const distributed = snapshot.envelopes.filter((envelope) => envelope.allocatedCents > 0);
  const totalAllocated = distributed.reduce((sum, envelope) => sum + envelope.allocatedCents, 0);
  const selected =
    snapshot.envelopes.find((envelope) => envelope.id === pickedId && envelope.allocatedCents > 0) ??
    distributed[0] ??
    null;
  const ranked = [...snapshot.envelopes].sort(
    (left, right) => right.spentCents - left.spentCents || left.name.localeCompare(right.name, "pt-BR"),
  );
  const incomesDiffer = snapshot.receivedIncomeCents !== snapshot.incomeCents;
  const { comparison, thresholds } = snapshot;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18.75rem] xl:items-start">
      <div className="grid min-w-0 gap-4">
        {incomesDiffer ? (
          <p role="status" className={cn(surfaceClassName, "px-4 py-3 text-sm leading-6 text-foreground")}>
            Renda recebida {formatCurrency(snapshot.receivedIncomeCents)}. Renda planejada{" "}
            {formatCurrency(snapshot.incomeCents)}. Os envelopes usam a planejada.
          </p>
        ) : null}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            label="Renda mensal"
            valueCents={snapshot.receivedIncomeCents}
            hint={incomesDiffer ? "Receitas do período" : "Igual à renda planejada"}
            icon={Wallet}
            size="compact"
            emphasis="gradient"
          />
          <SummaryCard
            label="Orçamento distribuído"
            valueCents={snapshot.summary.allocatedCents}
            hint="Destinado aos envelopes"
            icon={WalletCards}
            size="compact"
          />
          <SummaryCard
            label="Total gasto"
            valueCents={snapshot.summary.spentCents}
            hint="Despesas registradas"
            icon={Receipt}
            size="compact"
          />
          <SummaryCard
            label="Saldo disponível"
            valueCents={snapshot.summary.availableCents}
            hint="Distribuído menos o gasto"
            icon={Scale}
            size="compact"
          />
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Distribuição por categoria" description="Parte de cada envelope no orçamento do mês.">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11.5rem] sm:items-center">
              <div className="relative">
                <DistributionChart envelopes={snapshot.envelopes} selectedId={selected?.id ?? null} />
                {selected ? (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                    <div>
                      <p className="text-lg font-semibold tabular-nums text-foreground">
                        {totalAllocated > 0 ? Math.round((selected.allocatedCents / totalAllocated) * 100) : 0}%
                      </p>
                      <p className="max-w-28 truncate text-xs text-muted-foreground">{selected.name}</p>
                    </div>
                  </div>
                ) : null}
              </div>
              {selected ? <EnvelopeDetail envelope={selected} /> : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {distributed.map((envelope) => {
                const active = envelope.id === selected?.id;

                return (
                  <button
                    key={envelope.id}
                    type="button"
                    aria-pressed={active}
                    className={cn(
                      "inline-flex h-11 items-center gap-2 rounded-full border px-3 text-xs font-medium",
                      active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground",
                    )}
                    onClick={() => setPickedId(envelope.id)}
                  >
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: envelope.color }} aria-hidden />
                    {envelope.name}
                  </button>
                );
              })}
            </div>
          </ChartCard>
          <ChartCard
            title="Evolução do mês"
            description={
              comparison.previousMonthId
                ? `Dias de ${formatMonth(snapshot.monthId)}, com o mês anterior em tracejado.`
                : `Dias de ${formatMonth(snapshot.monthId)}.`
            }
          >
            <DailyFlowChart points={snapshot.daily} showPrevious={comparison.previousMonthId !== null} />
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <li className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded-full bg-[#E78A91]" aria-hidden />
                Despesas acumuladas
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded-full bg-[#64CBB1]" aria-hidden />
                Orçamento disponível
              </li>
              {comparison.previousMonthId ? (
                <li className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded-full bg-[#65B8E8]" aria-hidden />
                  Mês anterior
                </li>
              ) : null}
            </ul>
          </ChartCard>
        </section>
        <section className={cn(surfaceClassName, "p-4 sm:p-5")}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Gastos por categoria</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Abaixo de {thresholds.attentionFromPercent}% dentro do orçamento. De {thresholds.attentionFromPercent}% a{" "}
                {thresholds.criticalAbovePercent}% pede atenção. Acima de {thresholds.criticalAbovePercent}% é crítico.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {ranked.map((envelope) => (
              <article key={envelope.id} className="grid gap-3 rounded-2xl bg-muted/50 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-2xl bg-card"
                    style={{ color: envelope.color }}
                  >
                    <CategoryIcon name={envelope.icon} className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-foreground">{envelope.name}</h3>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", toneClassName[envelope.tone])}>
                        {toneLabel[envelope.tone]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                      Gasto {formatCurrency(envelope.spentCents)} de {formatCurrency(envelope.allocatedCents)}
                    </p>
                    <div className="mt-2">
                      <ProgressBar
                        value={envelope.consumedPercent}
                        tone={envelope.tone}
                        label={`Consumo de ${envelope.name}`}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:block sm:text-right">
                  <p className="text-sm font-semibold tabular-nums text-foreground">{envelope.consumedPercent}%</p>
                  <p
                    className={cn(
                      "text-xs tabular-nums",
                      envelope.availableCents < 0 ? "text-danger-ink" : "text-muted-foreground",
                    )}
                  >
                    Disponível {formatCurrency(envelope.availableCents)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <aside className="grid content-start gap-4">
        <section className={cn(surfaceClassName, "p-4 sm:p-5")}>
          <h2 className="text-sm font-semibold text-foreground">Comparação mensal</h2>
          {comparison.previousMonthId ? (
            <div className="mt-4 grid gap-4">
              <Delta
                label="Gastos"
                cents={comparison.spentDeltaCents}
                percent={comparison.spentDeltaPercent}
                upIsFavorable={false}
              />
              <Delta
                label="Receitas"
                cents={comparison.receivedDeltaCents}
                percent={comparison.receivedDeltaPercent}
                upIsFavorable
              />
              <Delta
                label="Orçamento"
                cents={comparison.allocatedDeltaCents}
                percent={comparison.allocatedDeltaPercent}
                upIsFavorable
              />
              <div>
                <h3 className="text-xs font-medium text-muted-foreground">Maior aumento de despesas</h3>
                {comparison.risingCategories.length === 0 ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Nenhuma categoria gastou mais do que em {formatMonth(comparison.previousMonthId)}.
                  </p>
                ) : (
                  <ul className="mt-2 grid gap-2">
                    {comparison.risingCategories.map((change) => (
                      <li key={change.id} className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-xl bg-muted" style={{ color: change.color }}>
                          <CategoryIcon name={change.icon} className="size-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{change.name}</p>
                          <p className="text-xs text-danger-ink tabular-nums">
                            +{formatCurrency(change.deltaCents)}
                            {change.deltaPercent !== null ? ` · +${change.deltaPercent}%` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {formatMonth(snapshot.monthId)} é o primeiro mês com orçamento. A comparação aparece a partir do mês
              seguinte.
            </p>
          )}
        </section>
        <section className={cn(surfaceClassName, "px-4 sm:px-5")}>
          <div className="flex items-center justify-between gap-3 pt-4">
            <h2 className="text-sm font-semibold text-foreground">Transações recentes</h2>
            <Link href="/transactions" className="text-sm font-medium text-accent-foreground hover:underline">
              Ver todas
            </Link>
          </div>
          {snapshot.transactions.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">Nenhuma movimentação neste mês.</p>
          ) : (
            <div className="divide-y divide-border/80">
              {snapshot.transactions.slice(0, 5).map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}

function EnvelopeDetail({ envelope }: { envelope: EnvelopeStatus }) {
  return (
    <div className="rounded-2xl bg-muted/60 p-3">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-xl bg-card" style={{ color: envelope.color }}>
          <CategoryIcon name={envelope.icon} className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{envelope.name}</p>
          <p className={cn("text-xs", toneClassName[envelope.tone], "bg-transparent px-0")}>{toneLabel[envelope.tone]}</p>
        </div>
      </div>
      <dl className="mt-3 grid gap-1.5 text-xs">
        <DetailRow label="Orçamento" cents={envelope.allocatedCents} />
        <DetailRow label="Gasto" cents={envelope.spentCents} />
        <DetailRow label="Disponível" cents={envelope.availableCents} negative={envelope.availableCents < 0} />
      </dl>
      <p className="mt-2 text-xs text-muted-foreground tabular-nums">Utilizado {envelope.consumedPercent}%</p>
      <div className="mt-2">
        <ProgressBar value={envelope.consumedPercent} tone={envelope.tone} label={`Consumo de ${envelope.name}`} />
      </div>
    </div>
  );
}

function DetailRow({ label, cents, negative = false }: { label: string; cents: Cents; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-semibold tabular-nums", negative ? "text-danger-ink" : "text-foreground")}>
        {formatCurrency(cents)}
      </dd>
    </div>
  );
}

function Delta({
  label,
  cents,
  percent,
  upIsFavorable,
}: {
  label: string;
  cents: Cents | null;
  percent: number | null;
  upIsFavorable: boolean;
}) {
  if (cents === null) {
    return null;
  }

  const increased = cents > 0;
  const favorable = cents === 0 || increased === upIsFavorable;
  const Icon = increased ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("mt-1 text-sm font-semibold tabular-nums", favorable ? "text-accent-foreground" : "text-danger-ink")}>
          {cents > 0 ? "+" : ""}
          {formatCurrency(cents)}
          {percent !== null ? ` · ${percent > 0 ? "+" : ""}${percent}%` : ""}
        </p>
      </div>
      {cents !== 0 ? <Icon className={cn("size-4", favorable ? "text-accent-foreground" : "text-danger-ink")} aria-hidden /> : null}
    </div>
  );
}
