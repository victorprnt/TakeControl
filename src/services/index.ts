import "server-only";

import { BudgetService } from "@/services/budget-service";
import { CategoryService } from "@/services/category-service";
import { createRepositories } from "@/services/providers";
import { RecurringExpenseService } from "@/services/recurring-expense-service";
import type { Repositories } from "@/services/repositories";
import { TransactionService } from "@/services/transaction-service";

export type Services = {
  categories: CategoryService;
  budgets: BudgetService;
  transactions: TransactionService;
  recurring: RecurringExpenseService;
};

export function createServices(repositories: Repositories = createRepositories()): Services {
  const categories = new CategoryService(repositories.categories);
  const transactions = new TransactionService(repositories.transactions, repositories.categories);
  const recurring = new RecurringExpenseService(repositories.recurringExpenses, repositories.categories);

  return {
    categories,
    transactions,
    recurring,
    budgets: new BudgetService(
      repositories.monthlyBudgets,
      repositories.categoryBudgets,
      categories,
      transactions,
      recurring,
    ),
  };
}

let services: Services | undefined;

export function getServices(): Services {
  services ??= createServices();
  return services;
}
