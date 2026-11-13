import type { LucideIcon } from "lucide-react";

import { surfaceClassName } from "@/components/shared/surface";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Cents } from "@/types/money";

type SummaryCardProps = {
  label: string;
  valueCents: Cents;
  hint?: string;
  icon?: LucideIcon;
  emphasis?: "default" | "gradient";
  size?: "default" | "compact";
  className?: string;
};

export function SummaryCard({
  label,
  valueCents,
  hint,
  icon: Icon,
  emphasis = "default",
  size = "default",
  className,
}: SummaryCardProps) {
  return (
    <article
      className={cn(
        surfaceClassName,
        "flex min-w-0 flex-col gap-3 p-4 sm:p-5",
        emphasis === "gradient" &&
          "bg-[linear-gradient(145deg,color-mix(in_srgb,var(--primary)_24%,var(--card))_0%,var(--card)_52%,color-mix(in_srgb,var(--info)_22%,var(--card))_100%)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-foreground ring-1 ring-white/25">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "truncate font-semibold tracking-tight text-foreground tabular-nums",
          size === "compact" ? "text-lg sm:text-2xl" : "text-2xl sm:text-3xl",
        )}
      >
        {formatCurrency(valueCents)}
      </p>
      {hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </article>
  );
}
