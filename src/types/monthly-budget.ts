import type { Cents } from "@/types/money";
import type { MonthId } from "@/types/month";

export type MonthlyBudget = {
  id: string;
  /** Calendar month, YYYY-MM. */
  month: MonthId;
  /** Salary for the month, integer cents. It can change from month to month. */
  income: Cents;
  /** Amount set aside by hand, integer cents. */
  saved: Cents;
  createdAt: string;
  updatedAt: string;
};
