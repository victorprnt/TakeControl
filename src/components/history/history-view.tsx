"use client";

import { ChartCard } from "@/components/charts/chart-card";
import { HistoryChart } from "@/components/charts/history-chart";
import { useMonth } from "@/components/layout/month-provider";
import { surfaceClassName } from "@/components/shared/surface";
import { demoHistory } from "@/constants/demo";
import { formatCurrency, formatMonth } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function HistoryView() {
  const { monthId } = useMonth();

  return (
    <div className="grid gap-4">
      <ChartCard
        title="Evolução dos gastos"
        description={`Série ilustrativa. Mês em destaque: ${formatMonth(monthId)}.`}
      >
        <HistoryChart points={demoHistory} />
      </ChartCard>
      <section className={cn(surfaceClassName, "divide-y divide-border/80 px-4 sm:px-5")}>
        {demoHistory.map((point) => (
          <div key={point.monthId} className="flex items-center justify-between gap-3 py-3">
            <p className="text-sm font-medium text-foreground">{point.label}</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {formatCurrency(point.spentCents)}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
