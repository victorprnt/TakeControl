import type { FixedBill } from "@/types/fixed-bill";
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

/** One day of the selected month. Amounts are integer cents. */
export type DailyFlowPoint = {
  day: number;
  label: string;
  cumulativeSpentCents: Cents;
  availableCents: Cents;
  /** Null on days the previous month does not have, and for every day when that month is absent. */
  previousCumulativeSpentCents: Cents | null;
};

export type CategoryChange = {
  id: string;
  name: string;
  icon: string;
  color: string;
  deltaCents: Cents;
  /** Null when the previous month spent nothing in this category. */
  deltaPercent: number | null;
};

/** Differences against the immediately previous budget month. Percents stay null without a valid base. */
export type MonthComparison = {
  previousMonthId: MonthId | null;
  spentDeltaCents: Cents | null;
  spentDeltaPercent: number | null;
  receivedDeltaCents: Cents | null;
  receivedDeltaPercent: number | null;
  allocatedDeltaCents: Cents | null;
  allocatedDeltaPercent: number | null;
  risingCategories: CategoryChange[];
};

export type BudgetThresholds = {
  attentionFromPercent: number;
  criticalAbovePercent: number;
};

export type FinanceSummary = {
  availableCents: Cents;
  allocatedCents: Cents;
  spentCents: Cents;
  reservedCents: Cents;
};

/** Dashboard totals. The budget is the salary plus the amount saved by hand. */
export type MonthOverview = {
  budgetCents: Cents;
  spentCents: Cents;
  balanceCents: Cents;
  savedCents: Cents;
  salaryCents: Cents;
};

/** How the month's income was split across envelopes. */
export type IncomeDistribution = {
  incomeCents: Cents;
  allocatedCents: Cents;
  unallocatedCents: Cents;
  allocatedPercent: number | null;
  overIncome: boolean;
};

/** Read model assembled by the budget service. Screens only display it. */
export type FinanceSnapshot = {
  monthId: MonthId;
  months: MonthId[];
  /** Planned income stored on the monthly budget. Envelope math uses this figure. */
  incomeCents: Cents;
  /** Sum of income transactions in the month. Each transaction is counted once. */
  receivedIncomeCents: Cents;
  summary: FinanceSummary;
  overview: MonthOverview;
  bills: FixedBill[];
  distribution: IncomeDistribution;
  envelopes: EnvelopeStatus[];
  transactions: MovementView[];
  recurring: MovementView[];
  history: HistoryPoint[];
  daily: DailyFlowPoint[];
  comparison: MonthComparison;
  thresholds: BudgetThresholds;
};
