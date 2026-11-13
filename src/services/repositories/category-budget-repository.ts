import type { CategoryBudget } from "@/types/category-budget";

export type NewCategoryBudget = {
  monthlyBudgetId: string;
  categoryId: string;
  allocatedAmount: CategoryBudget["allocatedAmount"];
};

export interface CategoryBudgetRepository {
  list(): Promise<CategoryBudget[]>;
  listByMonthlyBudget(monthlyBudgetId: string): Promise<CategoryBudget[]>;
  findById(id: string): Promise<CategoryBudget | null>;
  create(input: NewCategoryBudget): Promise<CategoryBudget>;
  update(id: string, input: Partial<NewCategoryBudget>): Promise<CategoryBudget>;
}
