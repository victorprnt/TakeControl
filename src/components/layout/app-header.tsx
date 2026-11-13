"use client";

import { Plus } from "lucide-react";

import { AccountMenu } from "@/components/layout/account-menu";
import { StreamMark } from "@/components/layout/stream-mark";
import { useFinance } from "@/components/layout/finance-provider";
import { useQuickExpense } from "@/components/layout/quick-expense";
import { MonthSelector } from "@/components/shared/month-selector";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { openExpense } = useQuickExpense();
  const { snapshot } = useFinance();

  return (
    <header className="px-4 py-4 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
          <StreamMark />
          <MonthSelector />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="hidden h-11 rounded-full px-4 md:inline-flex"
            onClick={openExpense}
            disabled={!snapshot}
          >
            <Plus />
            Nova despesa
          </Button>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
