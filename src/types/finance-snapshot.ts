import type { Cents } from "@/types/money";
import type { MonthId } from "@/types/month";

export type ProgressTone = "safe" | "warning" | "danger";

/** Envelope position for one month. Amounts are integer cents. */
export type EnvelopeStatus = {
  id: string;
  name: string;
  icon: string;
  color: string;
  allocatedCents: Cents;
  spentCents: Cents;
  availableCents: Cents;
  consumedPercent: number;
  tone: ProgressTone;
};

export type MovementView = {
  id: string;
  title: string;
  category: string;
  dateLabel: string;
  amountCents: Cents;
  direction: "in" | "out";
};

export type HistoryPoint = {
  monthId: MonthId;
  label: string;
  spentCents: Cents;
};

export type FinanceSummary = {
  availableCents: Cents;
  allocatedCents: Cents;
  spentCents: Cents;
  reservedCents: Cents;
};

/** Read model assembled by the budget service. Screens only display it. */
export type FinanceSnapshot = {
  monthId: MonthId;
  months: MonthId[];
  incomeCents: Cents;
  summary: FinanceSummary;
  envelopes: EnvelopeStatus[];
  transactions: MovementView[];
  recurring: MovementView[];
  history: HistoryPoint[];
};
