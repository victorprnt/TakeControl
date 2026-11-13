"use client";

import { ChartCard } from "@/components/charts/chart-card";
import { HistoryChart } from "@/components/charts/history-chart";
import { useFinanceSnapshot } from "@/components/layout/finance-provider";
import { surfaceClassName } from "@/components/shared/surface";
import { formatCurrency, formatMonth } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function HistoryView() {
  const snapshot = useFinanceSnapshot();

  if (!snapshot) {
    return null;
  }

  return (
    <div className="grid gap-4">
      <ChartCard
        title="Evolução dos gastos"
        description={`Meses com orçamento. Em destaque: ${formatMonth(snapshot.monthId)}.`}
      >
        <HistoryChart points={snapshot.history} />
      </ChartCard>
      <section className={cn(surfaceClassName, "divide-y divide-border/80 px-4 sm:px-5")}>
        {snapshot.history.map((point) => (
          <div key={point.monthId} className="flex items-center justify-between gap-3 py-3">
            <p className="text-sm font-medium text-foreground">{formatMonth(point.monthId)}</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(point.spentCents)}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
