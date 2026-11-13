"use client";

import { PiggyBank, Receipt, Wallet, WalletCards } from "lucide-react";

import { CategoryCard } from "@/components/categories/category-card";
import { ChartCard } from "@/components/charts/chart-card";
import { ExpenseChart } from "@/components/charts/expense-chart";
import { useMonth } from "@/components/layout/month-provider";
import { SummaryCard } from "@/components/shared/summary-card";
import { surfaceClassName } from "@/components/shared/surface";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { formatMonth } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const { monthId, snapshot } = useMonth();

  return (
    <div className="grid gap-4">
      <p className="text-xs text-muted-foreground">
        Valores ilustrativos de {formatMonth(monthId)}.
      </p>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Disponível"
          valueCents={snapshot.summary.availableCents}
          hint="Soma ainda livre nos envelopes"
          icon={Wallet}
          emphasis="gradient"
        />
        <SummaryCard
          label="Destinado"
          valueCents={snapshot.summary.allocatedCents}
          hint="Renda distribuída no mês"
          icon={WalletCards}
        />
        <SummaryCard
          label="Gasto"
          valueCents={snapshot.summary.spentCents}
          hint="Já saiu dos envelopes"
          icon={Receipt}
        />
        <SummaryCard
          label="Reserva"
          valueCents={snapshot.summary.reservedCents}
          hint="Ainda guardado na reserva"
          icon={PiggyBank}
        />
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {snapshot.categories.slice(0, 4).map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <ChartCard title="Gastos por envelope" description="Distribuição ilustrativa do mês.">
          <ExpenseChart categories={snapshot.categories} />
        </ChartCard>
        <section className={cn(surfaceClassName, "min-w-0 p-4 sm:p-5")}>
          <h2 className="text-sm font-semibold text-foreground">Movimentações recentes</h2>
          <div className="mt-2 divide-y divide-border/80">
            {snapshot.transactions.slice(0, 5).map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
