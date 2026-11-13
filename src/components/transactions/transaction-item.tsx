import type { ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import type { MovementView } from "@/types/finance-snapshot";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type TransactionItemProps = {
  transaction: MovementView;
  detail?: string;
  actions?: ReactNode;
};

export function TransactionItem({ transaction, detail, actions }: TransactionItemProps) {
  const incoming = transaction.direction === "in";
  const Icon = incoming ? ArrowDownLeft : ArrowUpRight;

  return (
    <article className="py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-2xl",
            incoming ? "bg-primary/20 text-accent-foreground" : "bg-destructive/15 text-danger-ink",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{transaction.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {transaction.category} · {transaction.dateLabel}
          </p>
        </div>
        <p
          className={cn(
            "shrink-0 text-sm font-semibold tabular-nums",
            incoming ? "text-accent-foreground" : "text-danger-ink",
          )}
        >
          {incoming ? "+" : "−"}
          {formatCurrency(transaction.amountCents)}
        </p>
      </div>
      {detail ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p> : null}
      {actions ? <div className="mt-2 flex gap-2">{actions}</div> : null}
    </article>
  );
}
