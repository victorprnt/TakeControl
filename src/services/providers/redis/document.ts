import {
  parseBillMonths,
  parseCategories,
  parseCategoryBudgets,
  parseFixedBills,
  parseMonthlyBudgets,
  parseRecurringExpenses,
  parseTransactions,
} from "@/services/providers/json-server/parse";
import type { CategoryBudget } from "@/types/category-budget";
import type { Category } from "@/types/category";
import type { FixedBill } from "@/types/fixed-bill";
import type { MonthlyBudget } from "@/types/monthly-budget";
import type { RecurringExpense } from "@/types/recurring-expense";
import type { Transaction } from "@/types/transaction";

/** Same collections as db.json. One Redis key stores this whole document. */
export type FinanceDocument = {
  categories: Category[];
  monthlyBudgets: MonthlyBudget[];
  categoryBudgets: CategoryBudget[];
  transactions: Transaction[];
  recurringExpenses: RecurringExpense[];
  fixedBills: FixedBill[];
  billMonths: { id: string; month: FixedBill["month"] }[];
};

export function parseFinanceDocument(value: unknown): FinanceDocument {
  const record = typeof value === "string" ? (JSON.parse(value) as unknown) : value;

  if (typeof record !== "object" || record === null || Array.isArray(record)) {
    throw new Error("Expected the finance document.");
  }

  const document = record as Record<string, unknown>;

  return {
    categories: parseCategories(document.categories ?? []),
    monthlyBudgets: parseMonthlyBudgets(document.monthlyBudgets ?? []),
    categoryBudgets: parseCategoryBudgets(document.categoryBudgets ?? []),
    transactions: parseTransactions(document.transactions ?? []),
    recurringExpenses: parseRecurringExpenses(document.recurringExpenses ?? []),
    fixedBills: parseFixedBills(document.fixedBills ?? []),
    billMonths: parseBillMonths(document.billMonths ?? []),
  };
}
