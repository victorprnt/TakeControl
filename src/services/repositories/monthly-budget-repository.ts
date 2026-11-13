import type { MonthlyBudget } from "@/types/monthly-budget";
import type { MonthId } from "@/types/month";

export type NewMonthlyBudget = {
  month: MonthId;
  income: MonthlyBudget["income"];
  saved: MonthlyBudget["saved"];
};

export interface MonthlyBudgetRepository {
  list(): Promise<MonthlyBudget[]>;
  findById(id: string): Promise<MonthlyBudget | null>;
  findByMonth(month: MonthId): Promise<MonthlyBudget | null>;
  create(input: NewMonthlyBudget): Promise<MonthlyBudget>;
  update(id: string, input: Partial<NewMonthlyBudget>): Promise<MonthlyBudget>;
}
