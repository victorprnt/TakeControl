"use client";

import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";

import { AccountMenu } from "@/components/layout/account-menu";
import { useQuickExpense } from "@/components/layout/quick-expense";
import { MonthSelector } from "@/components/shared/month-selector";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getNavItemByPath } from "@/constants/navigation";

export function AppHeader() {
  const pathname = usePathname();
  const page = getNavItemByPath(pathname);
  const { openExpense } = useQuickExpense();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-md md:px-6 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <PageHeader title={page.label} description={page.description} />
        <div className="flex items-center gap-2">
          <MonthSelector />
          <Button className="hidden h-11 rounded-full px-4 md:inline-flex" onClick={openExpense}>
            <Plus />
            Nova despesa
          </Button>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
