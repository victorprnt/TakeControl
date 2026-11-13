"use client";

import { PiggyBank, Receipt, Scale, WalletCards } from "lucide-react";

import { BillCard } from "@/components/dashboard/bill-card";
import { EnvelopeCard } from "@/components/dashboard/envelope-card";
import { useFinance, useFinanceSnapshot } from "@/components/layout/finance-provider";
import { SummaryCard } from "@/components/shared/summary-card";
import { BILLS_CATEGORY_ID } from "@/constants/finance";

export function DashboardView() {
  const snapshot = useFinanceSnapshot();
  const { retry } = useFinance();

  if (!snapshot) {
    return null;
  }

  const envelopes = snapshot.envelopes.filter((envelope) => envelope.id !== BILLS_CATEGORY_ID);
  const { overview } = snapshot;

  return (
    <div className="grid gap-8">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumo do mês">
        <SummaryCard
          label="Orçamento"
          valueCents={overview.budgetCents}
          hint="Envelopes e contas do mês"
          icon={WalletCards}
          size="compact"
          emphasis="gradient"
        />
        <SummaryCard
          label="Gastos"
          valueCents={overview.spentCents}
          hint="Envelopes e contas pagas"
          icon={Receipt}
          size="compact"
        />
        <SummaryCard
          label="Saldo"
          valueCents={overview.balanceCents}
          hint="Orçamento menos o gasto"
          icon={Scale}
          size="compact"
        />
        <SummaryCard
          label="Economizado"
          valueCents={overview.savedCents}
          hint="Ainda guardado na reserva"
          icon={PiggyBank}
          size="compact"
        />
      </section>

      <section className="grid gap-3">
        <div className="px-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Contas fixas</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Defina o valor de cada conta e marque quando ela for paga.
          </p>
        </div>
        {snapshot.bills.length === 0 ? (
          <p className="rounded-[1.4rem] bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma conta fixa neste mês.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {snapshot.bills.map((bill) => (
              <BillCard key={bill.id} bill={bill} onSaved={retry} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-3">
        <div className="px-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Envelopes</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Cada caixa mostra o orçamento, o gasto e o que ainda pode ser usado.
          </p>
        </div>
        {envelopes.length === 0 ? (
          <p className="rounded-[1.4rem] bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum envelope neste mês.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {envelopes.map((envelope) => (
              <EnvelopeCard key={envelope.id} envelope={envelope} monthId={snapshot.monthId} onSaved={retry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
