import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import type { DemoTransaction } from "@/constants/demo";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type TransactionItemProps = {
  transaction: DemoTransaction;
};

export function TransactionItem({ transaction }: TransactionItemProps) {
  const incoming = transaction.direction === "in";
  const Icon = incoming ? ArrowDownLeft : ArrowUpRight;

  return (
    <article className="flex min-w-0 items-center gap-3 py-3">
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
    </article>
  );
}
