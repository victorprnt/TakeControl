import type { CategoryBudgetRepository } from "@/services/repositories/category-budget-repository";
import type { CategoryRepository } from "@/services/repositories/category-repository";
import type { FixedBillRepository } from "@/services/repositories/fixed-bill-repository";
import type { MonthlyBudgetRepository } from "@/services/repositories/monthly-budget-repository";
import type { RecurringExpenseRepository } from "@/services/repositories/recurring-expense-repository";
import type { TransactionRepository } from "@/services/repositories/transaction-repository";

/**
 * The only data-access API used by services.
 * Implementations live in providers and are selected with DATA_PROVIDER.
 */
export interface Repositories {
  categories: CategoryRepository;
  monthlyBudgets: MonthlyBudgetRepository;
  categoryBudgets: CategoryBudgetRepository;
  transactions: TransactionRepository;
  recurringExpenses: RecurringExpenseRepository;
  fixedBills: FixedBillRepository;
}

export type { CategoryRepository, NewCategory } from "@/services/repositories/category-repository";
export type { CategoryBudgetRepository, NewCategoryBudget } from "@/services/repositories/category-budget-repository";
export type { MonthlyBudgetRepository, NewMonthlyBudget } from "@/services/repositories/monthly-budget-repository";
export type {
  NewRecurringExpense,
  RecurringExpensePatch,
  RecurringExpenseRepository,
} from "@/services/repositories/recurring-expense-repository";
export type { NewTransaction, TransactionPatch, TransactionRepository } from "@/services/repositories/transaction-repository";
