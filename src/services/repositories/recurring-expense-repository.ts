import type { RecurringExpense, RecurringFrequency } from "@/types/recurring-expense";

export type NewRecurringExpense = {
  description: string;
  amount: RecurringExpense["amount"];
  categoryId: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  isActive: boolean;
};

export interface RecurringExpenseRepository {
  list(): Promise<RecurringExpense[]>;
  findById(id: string): Promise<RecurringExpense | null>;
  create(input: NewRecurringExpense): Promise<RecurringExpense>;
  update(id: string, input: Partial<NewRecurringExpense>): Promise<RecurringExpense>;
}
