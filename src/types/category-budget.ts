import type { Cents } from "@/types/money";

export type CategoryBudget = {
  id: string;
  monthlyBudgetId: string;
  categoryId: string;
  /** Integer cents assigned to the envelope for one month. */
  allocatedAmount: Cents;
  createdAt: string;
  updatedAt: string;
};
