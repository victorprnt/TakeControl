"use client";

import { CategoryCard } from "@/components/categories/category-card";
import { useFinanceSnapshot } from "@/components/layout/finance-provider";

export function CategoriesView() {
  const snapshot = useFinanceSnapshot();

  if (!snapshot) {
    return null;
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {snapshot.envelopes.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </section>
  );
}
