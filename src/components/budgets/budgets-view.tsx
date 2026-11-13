"use client";

import { CategoryCard } from "@/components/categories/category-card";
import { useFinanceSnapshot } from "@/components/layout/finance-provider";
import { SummaryCard } from "@/components/shared/summary-card";

export function BudgetsView() {
  const snapshot = useFinanceSnapshot();

  if (!snapshot) {
    return null;
  }

  return (
    <div className="grid gap-4">
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
        {snapshot.envelopes.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </section>
    </div>
  );
}
