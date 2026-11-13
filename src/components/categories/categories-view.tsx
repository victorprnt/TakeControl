"use client";

import { CategoryCard } from "@/components/categories/category-card";
import { useMonth } from "@/components/layout/month-provider";

export function CategoriesView() {
  const { snapshot } = useMonth();

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {snapshot.categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </section>
  );
}
