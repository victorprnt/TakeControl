import type { ReactNode } from "react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { ProgressBar } from "@/components/shared/progress-bar";
import { surfaceClassName } from "@/components/shared/surface";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { EnvelopeStatus, ProgressTone } from "@/types/finance-snapshot";

const toneColor: Record<ProgressTone, string> = {
  safe: "var(--primary)",
  warning: "var(--warning)",
  danger: "var(--destructive)",
};

type CategoryCardProps = {
  category: EnvelopeStatus;
  action?: ReactNode;
};

export function CategoryCard({ category, action }: CategoryCardProps) {
  const ring = Math.min(100, Math.max(0, category.consumedPercent));

  return (
    <article className={cn(surfaceClassName, "flex min-w-0 flex-col gap-4 p-4")}>
      <div className="flex items-center gap-3">
        <div
          className="grid size-14 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${toneColor[category.tone]} ${ring}%, var(--muted) 0)`,
          }}
          aria-hidden
        >
          <span className="grid size-10 place-items-center rounded-full bg-card" style={{ color: category.color }}>
            <CategoryIcon name={category.icon} className="size-4" />
          </span>
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">{category.name}</h2>
          <p className="text-xs text-muted-foreground tabular-nums">Utilizado: {category.consumedPercent}%</p>
        </div>
      </div>
      <ProgressBar value={category.consumedPercent} tone={category.tone} label={`Consumo de ${category.name}`} />
      <dl className="grid gap-1.5 text-xs">
        <AmountRow label="Orçamento" cents={category.allocatedCents} />
        <AmountRow label="Gasto" cents={category.spentCents} />
        <AmountRow label="Disponível" cents={category.availableCents} negative={category.availableCents < 0} />
      </dl>
      {action}
    </article>
  );
}

function AmountRow({ label, cents, negative = false }: { label: string; cents: number; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-semibold tabular-nums", negative ? "text-danger-ink" : "text-foreground")}>
        {formatCurrency(cents)}
      </dd>
    </div>
  );
}
