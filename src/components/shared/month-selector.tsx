"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useFinance } from "@/components/layout/finance-provider";
import { formatMonthShort } from "@/lib/formatters";

export function MonthSelector() {
  const { snapshot, status, selectMonth } = useFinance();
  const months = snapshot?.months ?? [];
  const monthId = snapshot?.monthId;
  const index = monthId ? months.indexOf(monthId) : -1;
  const busy = status === "loading";

  return (
    <div className="flex h-11 items-center rounded-full bg-card px-1 shadow-[0_10px_24px_-20px_rgba(37,55,70,0.6)]">
      <button
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        aria-label="Mês anterior"
        disabled={busy || index <= 0}
        onClick={() => {
          const previous = months[index - 1];
          if (previous) {
            selectMonth(previous);
          }
        }}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      <span className="min-w-[6.75rem] px-1 text-center text-xs font-semibold whitespace-nowrap text-foreground sm:text-sm">
        {monthId ? formatMonthShort(monthId) : "Mês"}
      </span>
      <button
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        aria-label="Próximo mês"
        disabled={busy || index === -1 || index >= months.length - 1}
        onClick={() => {
          const next = months[index + 1];
          if (next) {
            selectMonth(next);
          }
        }}
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </div>
  );
}
