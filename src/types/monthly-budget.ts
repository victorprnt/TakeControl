import type { Cents } from "@/types/money";
import type { MonthId } from "@/types/month";

export type MonthlyBudget = {
  id: string;
  /** Calendar month, YYYY-MM. */
  month: MonthId;
  /** Integer cents. */
  income: Cents;
  createdAt: string;
  updatedAt: string;
};
