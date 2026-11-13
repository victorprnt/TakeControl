import {
  Bus,
  CreditCard,
  HeartPulse,
  House,
  PiggyBank,
  ShoppingBasket,
  Sparkles,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { ProgressBar } from "@/components/shared/progress-bar";
import { surfaceClassName } from "@/components/shared/surface";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { EnvelopeStatus, ProgressTone } from "@/types/finance-snapshot";

const icons: Record<string, LucideIcon> = {
  basket: ShoppingBasket,
  pharmacy: HeartPulse,
  spark: Sparkles,
  user: UserRound,
  home: House,
  bus: Bus,
  piggy: PiggyBank,
  card: CreditCard,
};

const toneColor: Record<ProgressTone, string> = {
  safe: "var(--primary)",
  warning: "var(--warning)",
  danger: "var(--destructive)",
};

type CategoryCardProps = {
  category: EnvelopeStatus;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = icons[category.icon] ?? Wallet;
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
            <Icon className="size-4" />
          </span>
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">{category.name}</h2>
          <p className="text-xs text-muted-foreground tabular-nums">{category.consumedPercent}% do envelope</p>
        </div>
      </div>
      <ProgressBar value={category.consumedPercent} tone={category.tone} label={`Consumo de ${category.name}`} />
      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div className="min-w-0">
          <dt className="text-muted-foreground">Gasto</dt>
          <dd className="truncate font-semibold text-foreground tabular-nums">
            {formatCurrency(category.spentCents)}
          </dd>
        </div>
        <div className="min-w-0 text-right">
          <dt className="text-muted-foreground">Disponível</dt>
          <dd
            className={cn(
              "truncate font-semibold tabular-nums",
              category.availableCents < 0 ? "text-danger-ink" : "text-foreground",
            )}
          >
            {formatCurrency(category.availableCents)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
