"use client";

import { CategoryCard } from "@/components/categories/category-card";
import { useMonth } from "@/components/layout/month-provider";
import { SummaryCard } from "@/components/shared/summary-card";
import { formatMonth } from "@/lib/formatters";

export function BudgetsView() {
  const { monthId, snapshot } = useMonth();

  return (
    <div className="grid gap-4">
      <p className="text-xs text-muted-foreground">
        Envelopes ilustrativos de {formatMonth(monthId)}.
      </p>
      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Destinado" valueCents={snapshot.summary.allocatedCents} />
        <SummaryCard label="Gasto" valueCents={snapshot.summary.spentCents} />
        <SummaryCard
          label="Disponível"
          valueCents={snapshot.summary.availableCents}
          emphasis="gradient"
        />
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {snapshot.categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </section>
    </div>
  );
}
