import type { Cents } from "@/types/money";

export type RecurringFrequency = "weekly" | "monthly" | "yearly";

export type RecurringExpense = {
  id: string;
  description: string;
  /** Integer cents. */
  amount: Cents;
  categoryId: string;
  frequency: RecurringFrequency;
  /** Calendar date, YYYY-MM-DD. */
  startDate: string;
  /** Calendar date, YYYY-MM-DD. */
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
