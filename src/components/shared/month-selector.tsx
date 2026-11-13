"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useMonth } from "@/components/layout/month-provider";
import { demoMonths } from "@/constants/demo";
import { formatMonthShort } from "@/lib/formatters";

export function MonthSelector() {
  const { monthId, setMonthId } = useMonth();
  const index = demoMonths.indexOf(monthId as (typeof demoMonths)[number]);
  const currentIndex = index === -1 ? demoMonths.length - 1 : index;

  return (
    <div className="flex h-11 items-center rounded-full bg-card px-1 shadow-[0_10px_24px_-20px_rgba(37,55,70,0.6)]">
      <button
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        aria-label="Mês anterior"
        disabled={currentIndex === 0}
        onClick={() => {
          const previous = demoMonths[currentIndex - 1];
          if (previous) {
            setMonthId(previous);
          }
        }}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      <span className="min-w-[6.75rem] px-1 text-center text-xs font-semibold whitespace-nowrap text-foreground sm:text-sm">
        {formatMonthShort(monthId)}
      </span>
      <button
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        aria-label="Próximo mês"
        disabled={currentIndex === demoMonths.length - 1}
        onClick={() => {
          const next = demoMonths[currentIndex + 1];
          if (next) {
            setMonthId(next);
          }
        }}
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </div>
  );
}
