import "server-only";

import { RESERVE_CATEGORY_ID } from "@/constants/finance";
import { formatDateOnly, formatFrequency, formatMonthTiny } from "@/lib/formatters";
import { isMonthId } from "@/lib/validations/month-id";
import type { CategoryService } from "@/services/category-service";
import { DataAccessError } from "@/services/errors";
import type { CategoryBudgetRepository } from "@/services/repositories/category-budget-repository";
import type { MonthlyBudgetRepository } from "@/services/repositories/monthly-budget-repository";
import type { RecurringExpenseService } from "@/services/recurring-expense-service";
import { isInMonth, type TransactionService } from "@/services/transaction-service";
import type { Category } from "@/types/category";
import type { CategoryBudget } from "@/types/category-budget";
import type { EnvelopeStatus, FinanceSnapshot, HistoryPoint, MovementView, ProgressTone } from "@/types/finance-snapshot";
import type { MonthId } from "@/types/month";
import type { MonthlyBudget } from "@/types/monthly-budget";
import type { RecurringExpense } from "@/types/recurring-expense";
import type { Transaction } from "@/types/transaction";

function toneFor(percent: number): ProgressTone {
  if (percent >= 100) {
    return "danger";
  }

  if (percent >= 85) {
    return "warning";
  }

  return "safe";
}

function consumedPercent(spent: number, allocated: number): number {
  if (allocated <= 0) {
    return spent > 0 ? 100 : 0;
  }

  return Math.round((spent / allocated) * 100);
}

export class BudgetService {
  constructor(
    private readonly monthlyBudgets: MonthlyBudgetRepository,
    private readonly categoryBudgets: CategoryBudgetRepository,
    private readonly categories: CategoryService,
    private readonly transactions: TransactionService,
    private readonly recurring: RecurringExpenseService,
  ) {}

  async getSnapshot(monthId?: string): Promise<FinanceSnapshot> {
    const [budgets, categories, allocations, transactions, recurring] = await Promise.all([
      this.monthlyBudgets.list(),
      this.categories.list(),
      this.categoryBudgets.list(),
      this.transactions.list(),
      this.recurring.listActive(),
    ]);

    const months = this.monthIds(budgets);

    if (months.length === 0) {
      throw new DataAccessError("Nenhum orçamento mensal foi encontrado.", "empty");
    }

    const selected = monthId ?? months[months.length - 1];

    if (!selected || !isMonthId(selected) || !months.includes(selected)) {
      throw new DataAccessError("Esse mês não tem orçamento.", "not_found");
    }

    this.ensureExpensesHaveEnvelopes(months, budgets, allocations, transactions);

    const budget = this.budgetFor(budgets, selected);
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const envelopes = this.envelopes(
      categories,
      allocations.filter((allocation) => allocation.monthlyBudgetId === budget.id),
      transactions,
      selected,
    );
    const allocatedCents = envelopes.reduce((total, envelope) => total + envelope.allocatedCents, 0);
    const spentCents = envelopes.reduce((total, envelope) => total + envelope.spentCents, 0);
    const reserve = envelopes.find((envelope) => envelope.id === RESERVE_CATEGORY_ID);

    return {
      monthId: selected,
      months,
      incomeCents: budget.income,
      summary: {
        allocatedCents,
        spentCents,
        availableCents: allocatedCents - spentCents,
        reservedCents: reserve?.availableCents ?? 0,
      },
      envelopes,
      transactions: this.movements(transactions, categoryById, selected),
      recurring: this.recurringMovements(recurring, categoryById),
      history: this.history(months, transactions),
    };
  }

  private monthIds(budgets: MonthlyBudget[]): MonthId[] {
    const months = budgets.map((budget) => budget.month);
    const unique = [...new Set(months)].sort();

    if (unique.length !== months.length) {
      throw new DataAccessError("Há mais de um orçamento para o mesmo mês.", "conflict");
    }

    return unique;
  }

  private budgetFor(budgets: MonthlyBudget[], month: MonthId): MonthlyBudget {
    const budget = budgets.find((item) => item.month === month);

    if (!budget) {
      throw new DataAccessError("Esse mês não tem orçamento.", "not_found");
    }

    return budget;
  }

  private ensureExpensesHaveEnvelopes(
    months: MonthId[],
    budgets: MonthlyBudget[],
    allocations: CategoryBudget[],
    transactions: Transaction[],
  ): void {
    for (const month of months) {
      const budget = this.budgetFor(budgets, month);
      const allocated = new Set(
        allocations
          .filter((allocation) => allocation.monthlyBudgetId === budget.id)
          .map((allocation) => allocation.categoryId),
      );

      for (const transaction of transactions) {
        if (transaction.type !== "expense" || !isInMonth(transaction.date, month)) {
          continue;
        }

        if (!transaction.categoryId || !allocated.has(transaction.categoryId)) {
          throw new DataAccessError("Há uma despesa sem envelope neste mês.", "invalid");
        }
      }
    }
  }

  private envelopes(
    categories: Category[],
    allocations: CategoryBudget[],
    transactions: Transaction[],
    month: MonthId,
  ): EnvelopeStatus[] {
    const byCategory = new Map<string, CategoryBudget>();

    for (const allocation of allocations) {
      if (byCategory.has(allocation.categoryId)) {
        throw new DataAccessError("Há duas destinações para a mesma categoria neste mês.", "conflict");
      }

      byCategory.set(allocation.categoryId, allocation);
    }

    const known = new Set(categories.map((category) => category.id));

    for (const categoryId of byCategory.keys()) {
      if (!known.has(categoryId)) {
        throw new DataAccessError("Uma destinação aponta para uma categoria que não existe.", "invalid");
      }
    }

    return categories.flatMap((category) => {
      const allocation = byCategory.get(category.id);

      if (!allocation) {
        return [];
      }

      const spentCents = transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.categoryId === category.id &&
            isInMonth(transaction.date, month),
        )
        .reduce((total, transaction) => total + transaction.amount, 0);
      const percent = consumedPercent(spentCents, allocation.allocatedAmount);

      return [
        {
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          allocatedCents: allocation.allocatedAmount,
          spentCents,
          availableCents: allocation.allocatedAmount - spentCents,
          consumedPercent: percent,
          tone: toneFor(percent),
        },
      ];
    });
  }

  private movements(transactions: Transaction[], categories: Map<string, Category>, month: MonthId): MovementView[] {
    return transactions
      .filter((transaction) => isInMonth(transaction.date, month))
      .sort((left, right) => right.date.localeCompare(left.date) || right.id.localeCompare(left.id))
      .map((transaction) => ({
        id: transaction.id,
        title: transaction.description,
        category: this.categoryName(categories, transaction.categoryId, transaction.type),
        dateLabel: formatDateOnly(transaction.date),
        amountCents: transaction.amount,
        direction: transaction.type === "income" ? "in" : "out",
      }));
  }

  private recurringMovements(expenses: RecurringExpense[], categories: Map<string, Category>): MovementView[] {
    return [...expenses]
      .sort((left, right) => right.amount - left.amount || left.description.localeCompare(right.description, "pt-BR"))
      .map((expense) => ({
        id: expense.id,
        title: expense.description,
        category: this.categoryName(categories, expense.categoryId, "expense"),
        dateLabel: `${formatFrequency(expense.frequency)} · desde ${formatDateOnly(expense.startDate)}`,
        amountCents: expense.amount,
        direction: "out" as const,
      }));
  }

  private history(months: MonthId[], transactions: Transaction[]): HistoryPoint[] {
    return months.map((month) => ({
      monthId: month,
      label: formatMonthTiny(month),
      spentCents: transactions
        .filter((transaction) => transaction.type === "expense" && isInMonth(transaction.date, month))
        .reduce((total, transaction) => total + transaction.amount, 0),
    }));
  }

  private categoryName(
    categories: Map<string, Category>,
    categoryId: string | null,
    type: Transaction["type"],
  ): string {
    if (!categoryId) {
      return type === "income" ? "Entrada" : "Sem categoria";
    }

    const category = categories.get(categoryId);

    if (!category) {
      throw new DataAccessError("Uma movimentação aponta para uma categoria que não existe.", "invalid");
    }

    return category.name;
  }
}
