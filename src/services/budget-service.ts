import "server-only";

import { budgetThresholds } from "@/constants/budget-thresholds";
import { BILLS_CATEGORY_ID, RESERVE_CATEGORY_ID } from "@/constants/finance";
import { formatDateOnly, formatFrequency, formatMonthTiny, getPreviousMonth, monthDateRange } from "@/lib/formatters";
import { isMonthId } from "@/lib/validations/month-id";
import type { CategoryService } from "@/services/category-service";
import { DataAccessError } from "@/services/errors";
import type { FixedBillService } from "@/services/fixed-bill-service";
import type { CategoryBudgetRepository } from "@/services/repositories/category-budget-repository";
import type { MonthlyBudgetRepository } from "@/services/repositories/monthly-budget-repository";
import type { RecurringExpenseService } from "@/services/recurring-expense-service";
import { isInMonth, type TransactionService } from "@/services/transaction-service";
import type { Category } from "@/types/category";
import type { CategoryBudget } from "@/types/category-budget";
import type { CategorySpendingMonth } from "@/types/category-spending";
import type {
  CategoryChange,
  DailyFlowPoint,
  EnvelopeStatus,
  FinanceSnapshot,
  HistoryPoint,
  IncomeDistribution,
  MonthComparison,
  MovementView,
  ProgressTone,
} from "@/types/finance-snapshot";
import type { MonthAllocationDraft, MonthAllocationInput, MonthPlan } from "@/types/month-plan";
import type { MonthId } from "@/types/month";
import type { MonthlyBudget } from "@/types/monthly-budget";
import type { RecurringExpense } from "@/types/recurring-expense";
import type { Transaction } from "@/types/transaction";

function toneFor(percent: number): ProgressTone {
  if (percent > budgetThresholds.criticalAbovePercent) {
    return "danger";
  }

  if (percent >= budgetThresholds.attentionFromPercent) {
    return "warning";
  }

  return "safe";
}

function changePercent(delta: number, base: number): number | null {
  if (base <= 0) {
    return null;
  }

  return Math.round((delta / base) * 100);
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
    private readonly bills: FixedBillService,
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

    this.ensureExpensesHaveEnvelopes(months, budgets, allocations, transactions, categories);

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
    const receivedIncomeCents = this.receivedIncome(transactions, selected);
    const reserve = envelopes.find((envelope) => envelope.id === RESERVE_CATEGORY_ID);
    const bills = await this.bills.listForMonth(selected);
    const spendingEnvelopes = envelopes.filter((envelope) => envelope.id !== BILLS_CATEGORY_ID);
    const envelopeBudgetCents = spendingEnvelopes.reduce((total, envelope) => total + envelope.allocatedCents, 0);
    const envelopeSpentCents = spendingEnvelopes.reduce((total, envelope) => total + envelope.spentCents, 0);
    const billBudgetCents = bills.reduce((total, bill) => total + bill.amount, 0);
    const billSpentCents = bills.filter((bill) => bill.paid).reduce((total, bill) => total + bill.amount, 0);
    const budgetCents = envelopeBudgetCents + billBudgetCents;
    const overviewSpentCents = envelopeSpentCents + billSpentCents;
    const previousMonthId = getPreviousMonth(selected);
    const previousBudget = budgets.find((item) => item.month === previousMonthId);
    const previousEnvelopes = previousBudget
      ? this.envelopes(
          categories,
          allocations.filter((allocation) => allocation.monthlyBudgetId === previousBudget.id),
          transactions,
          previousMonthId,
        )
      : [];

    return {
      monthId: selected,
      months,
      incomeCents: budget.income,
      receivedIncomeCents,
      summary: {
        allocatedCents,
        spentCents,
        availableCents: allocatedCents - spentCents,
        reservedCents: reserve?.availableCents ?? 0,
      },
      overview: {
        budgetCents,
        spentCents: overviewSpentCents,
        balanceCents: budgetCents - overviewSpentCents,
        savedCents: reserve?.availableCents ?? 0,
      },
      bills,
      distribution: this.distribution(budget.income, allocatedCents),
      envelopes,
      transactions: this.movements(transactions, categoryById, selected),
      recurring: this.recurringMovements(recurring, categoryById),
      history: this.history(months, transactions),
      daily: this.dailyFlow(selected, allocatedCents, transactions, previousBudget ? previousMonthId : null),
      comparison: this.comparison(
        previousBudget ? previousMonthId : null,
        spentCents,
        receivedIncomeCents,
        allocatedCents,
        envelopes,
        previousEnvelopes,
        previousBudget ? this.receivedIncome(transactions, previousMonthId) : 0,
      ),
      thresholds: {
        attentionFromPercent: budgetThresholds.attentionFromPercent,
        criticalAbovePercent: budgetThresholds.criticalAbovePercent,
      },
    };
  }

  async getCategorySpending(categoryId: string): Promise<CategorySpendingMonth[]> {
    await this.categories.get(categoryId);
    const [budgets, allocations, transactions] = await Promise.all([
      this.monthlyBudgets.list(),
      this.categoryBudgets.list(),
      this.transactions.list(),
    ]);

    return this.monthIds(budgets).flatMap((month) => {
      const budget = this.budgetFor(budgets, month);
      const allocation = allocations.find(
        (item) => item.monthlyBudgetId === budget.id && item.categoryId === categoryId,
      );
      const spentCents = transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.categoryId === categoryId &&
            isInMonth(transaction.date, month),
        )
        .reduce((total, transaction) => total + transaction.amount, 0);
      const allocatedCents = allocation?.allocatedAmount ?? 0;

      if (allocatedCents === 0 && spentCents === 0) {
        return [];
      }

      return [{ monthId: month, allocatedCents, spentCents }];
    });
  }

  async prepareMonth(monthId: string): Promise<MonthPlan> {
    if (!isMonthId(monthId)) {
      throw new DataAccessError("O mês precisa estar no formato AAAA-MM.", "invalid");
    }

    const [budgets, categories, allocations] = await Promise.all([
      this.monthlyBudgets.list(),
      this.categories.list(),
      this.categoryBudgets.list(),
    ]);
    const existing = budgets.find((budget) => budget.month === monthId);
    const active = categories.filter((category) => category.isActive);

    if (existing) {
      const saved = allocations.filter((allocation) => allocation.monthlyBudgetId === existing.id);
      return {
        monthId,
        alreadySaved: true,
        incomeCents: existing.income,
        allocations: this.savedAllocations(categories, active, saved),
      };
    }

    const previous = budgets.find((budget) => budget.month === getPreviousMonth(monthId));
    const previousRows = previous
      ? allocations.filter((allocation) => allocation.monthlyBudgetId === previous.id)
      : [];

    return {
      monthId,
      alreadySaved: false,
      incomeCents: previous?.income ?? 0,
      allocations: active.map((category) => {
        const carried = previousRows.find((allocation) => allocation.categoryId === category.id);

        return {
          categoryId: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          allocatedCents: carried?.allocatedAmount ?? category.defaultBudget,
          source: carried ? "previous" : "default",
        };
      }),
    };
  }

  async saveMonth(monthId: string, incomeCents: number, allocations: MonthAllocationInput[]): Promise<MonthId> {
    if (!isMonthId(monthId)) {
      throw new DataAccessError("O mês precisa estar no formato AAAA-MM.", "invalid");
    }

    const income = this.money(incomeCents, "A renda");
    const lines = this.uniqueAllocations(allocations);
    await this.ensureCategories(lines.map((line) => line.categoryId));

    const existing = await this.monthlyBudgets.findByMonth(monthId);
    const budget = existing
      ? await this.monthlyBudgets.update(existing.id, { income })
      : await this.monthlyBudgets.create({ month: monthId, income });

    await this.syncAllocations(budget.id, lines);
    return monthId;
  }

  /**
   * Replaces the planned income with the sum of income transactions.
   * The previous plan is not added on top of the receipts.
   */
  async applyReceivedIncome(monthId: string): Promise<number> {
    if (!isMonthId(monthId)) {
      throw new DataAccessError("O mês precisa estar no formato AAAA-MM.", "invalid");
    }

    const budget = await this.monthlyBudgets.findByMonth(monthId);

    if (!budget) {
      throw new DataAccessError("Esse mês não tem orçamento.", "not_found");
    }

    const received = this.receivedIncome(await this.transactions.listForMonth(monthId), monthId);
    await this.monthlyBudgets.update(budget.id, { income: received });
    return received;
  }

  async updateIncome(monthId: string, incomeCents: number): Promise<void> {
    if (!isMonthId(monthId)) {
      throw new DataAccessError("O mês precisa estar no formato AAAA-MM.", "invalid");
    }

    const budget = await this.monthlyBudgets.findByMonth(monthId);

    if (!budget) {
      throw new DataAccessError("Esse mês não tem orçamento.", "not_found");
    }

    await this.monthlyBudgets.update(budget.id, { income: this.money(incomeCents, "A renda") });
  }

  async updateAllocation(monthId: string, categoryId: string, allocatedCents: number): Promise<void> {
    if (!isMonthId(monthId)) {
      throw new DataAccessError("O mês precisa estar no formato AAAA-MM.", "invalid");
    }

    const amount = this.money(allocatedCents, "O orçamento da categoria");
    const budget = await this.monthlyBudgets.findByMonth(monthId);

    if (!budget) {
      throw new DataAccessError("Esse mês não tem orçamento.", "not_found");
    }

    await this.categories.get(categoryId);
    await this.syncAllocations(budget.id, [{ categoryId, allocatedCents: amount }]);
  }

  private distribution(incomeCents: number, allocatedCents: number): IncomeDistribution {
    return {
      incomeCents,
      allocatedCents,
      unallocatedCents: incomeCents - allocatedCents,
      allocatedPercent: incomeCents > 0 ? Math.round((allocatedCents / incomeCents) * 100) : null,
      overIncome: allocatedCents > incomeCents,
    };
  }

  private savedAllocations(
    categories: Category[],
    active: Category[],
    saved: CategoryBudget[],
  ): MonthAllocationDraft[] {
    const drafts = active.map((category) => {
      const row = saved.find((allocation) => allocation.categoryId === category.id);

      return {
        categoryId: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        allocatedCents: row?.allocatedAmount ?? 0,
        source: row ? "saved" : "default",
      } satisfies MonthAllocationDraft;
    });

    for (const row of saved) {
      if (drafts.some((draft) => draft.categoryId === row.categoryId)) {
        continue;
      }

      const category = categories.find((item) => item.id === row.categoryId);

      if (!category) {
        throw new DataAccessError("Uma destinação aponta para uma categoria que não existe.", "invalid");
      }

      drafts.push({
        categoryId: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        allocatedCents: row.allocatedAmount,
        source: "saved",
      });
    }

    return drafts;
  }

  private uniqueAllocations(allocations: MonthAllocationInput[]): MonthAllocationInput[] {
    const seen = new Set<string>();

    return allocations.map((allocation) => {
      if (seen.has(allocation.categoryId)) {
        throw new DataAccessError("Há duas destinações para a mesma categoria neste mês.", "conflict");
      }

      seen.add(allocation.categoryId);
      return {
        categoryId: allocation.categoryId,
        allocatedCents: this.money(allocation.allocatedCents, "O orçamento da categoria"),
      };
    });
  }

  private async ensureCategories(categoryIds: string[]): Promise<void> {
    const categories = await this.categories.list();
    const known = new Set(categories.map((category) => category.id));

    for (const categoryId of categoryIds) {
      if (!known.has(categoryId)) {
        throw new DataAccessError("Categoria não encontrada.", "not_found", 404);
      }
    }
  }

  private async syncAllocations(monthlyBudgetId: string, allocations: MonthAllocationInput[]): Promise<void> {
    const current = await this.categoryBudgets.listByMonthlyBudget(monthlyBudgetId);

    for (const allocation of allocations) {
      const matches = current.filter((item) => item.categoryId === allocation.categoryId);

      if (matches.length > 1) {
        throw new DataAccessError("Há duas destinações para a mesma categoria neste mês.", "conflict");
      }

      const existing = matches[0];

      if (existing) {
        if (existing.allocatedAmount !== allocation.allocatedCents) {
          await this.categoryBudgets.update(existing.id, { allocatedAmount: allocation.allocatedCents });
        }
        continue;
      }

      await this.categoryBudgets.create({
        monthlyBudgetId,
        categoryId: allocation.categoryId,
        allocatedAmount: allocation.allocatedCents,
      });
    }
  }

  private money(value: number, label: string): number {
    if (!Number.isInteger(value) || value < 0) {
      throw new DataAccessError(`${label} precisa ser um valor inteiro em centavos.`, "invalid");
    }

    return value;
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

  private receivedIncome(transactions: Transaction[], month: MonthId): number {
    return transactions
      .filter((transaction) => transaction.type === "income" && isInMonth(transaction.date, month))
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  private ensureExpensesHaveEnvelopes(
    months: MonthId[],
    budgets: MonthlyBudget[],
    allocations: CategoryBudget[],
    transactions: Transaction[],
    categories: Category[],
  ): void {
    const categoryById = new Map(categories.map((category) => [category.id, category]));

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

        const category = transaction.categoryId ? categoryById.get(transaction.categoryId) : undefined;

        if (!category) {
          throw new DataAccessError("Há uma despesa sem envelope neste mês.", "invalid");
        }

        if (!allocated.has(category.id) && !category.isActive) {
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

      if (!allocation && !category.isActive) {
        return [];
      }

      const allocatedAmount = allocation?.allocatedAmount ?? 0;
      const spentCents = transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.categoryId === category.id &&
            isInMonth(transaction.date, month),
        )
        .reduce((total, transaction) => total + transaction.amount, 0);
      const percent = consumedPercent(spentCents, allocatedAmount);

      return [
        {
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          allocatedCents: allocatedAmount,
          spentCents,
          availableCents: allocatedAmount - spentCents,
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

  private dailyFlow(
    month: MonthId,
    allocatedCents: number,
    transactions: Transaction[],
    previousMonth: MonthId | null,
  ): DailyFlowPoint[] {
    const lastDay = Number(monthDateRange(month).end.slice(-2));
    const previousLastDay = previousMonth ? Number(monthDateRange(previousMonth).end.slice(-2)) : 0;
    const spentByDay = this.spentByDay(transactions, month);
    const previousByDay = previousMonth ? this.spentByDay(transactions, previousMonth) : new Map<number, number>();
    let cumulative = 0;
    let previousCumulative = 0;
    const points: DailyFlowPoint[] = [];

    for (let day = 1; day <= lastDay; day += 1) {
      cumulative += spentByDay.get(day) ?? 0;
      const hasPreviousDay = previousMonth !== null && day <= previousLastDay;

      if (hasPreviousDay) {
        previousCumulative += previousByDay.get(day) ?? 0;
      }

      points.push({
        day,
        label: String(day),
        cumulativeSpentCents: cumulative,
        availableCents: allocatedCents - cumulative,
        previousCumulativeSpentCents: hasPreviousDay ? previousCumulative : null,
      });
    }

    return points;
  }

  private spentByDay(transactions: Transaction[], month: MonthId): Map<number, number> {
    const spent = new Map<number, number>();

    for (const transaction of transactions) {
      if (transaction.type !== "expense" || !isInMonth(transaction.date, month)) {
        continue;
      }

      const day = Number(transaction.date.slice(-2));
      spent.set(day, (spent.get(day) ?? 0) + transaction.amount);
    }

    return spent;
  }

  private comparison(
    previousMonthId: MonthId | null,
    spentCents: number,
    receivedIncomeCents: number,
    allocatedCents: number,
    envelopes: EnvelopeStatus[],
    previousEnvelopes: EnvelopeStatus[],
    previousReceived: number,
  ): MonthComparison {
    if (!previousMonthId) {
      return {
        previousMonthId: null,
        spentDeltaCents: null,
        spentDeltaPercent: null,
        receivedDeltaCents: null,
        receivedDeltaPercent: null,
        allocatedDeltaCents: null,
        allocatedDeltaPercent: null,
        risingCategories: [],
      };
    }

    const previousSpent = previousEnvelopes.reduce((total, envelope) => total + envelope.spentCents, 0);
    const previousAllocated = previousEnvelopes.reduce((total, envelope) => total + envelope.allocatedCents, 0);
    const spentDelta = spentCents - previousSpent;
    const receivedDelta = receivedIncomeCents - previousReceived;
    const allocatedDelta = allocatedCents - previousAllocated;

    return {
      previousMonthId,
      spentDeltaCents: spentDelta,
      spentDeltaPercent: changePercent(spentDelta, previousSpent),
      receivedDeltaCents: receivedDelta,
      receivedDeltaPercent: changePercent(receivedDelta, previousReceived),
      allocatedDeltaCents: allocatedDelta,
      allocatedDeltaPercent: changePercent(allocatedDelta, previousAllocated),
      risingCategories: this.risingCategories(envelopes, previousEnvelopes),
    };
  }

  private risingCategories(envelopes: EnvelopeStatus[], previousEnvelopes: EnvelopeStatus[]): CategoryChange[] {
    return envelopes
      .map((envelope) => {
        const previousSpent = previousEnvelopes.find((item) => item.id === envelope.id)?.spentCents ?? 0;
        const deltaCents = envelope.spentCents - previousSpent;

        return {
          id: envelope.id,
          name: envelope.name,
          icon: envelope.icon,
          color: envelope.color,
          deltaCents,
          deltaPercent: changePercent(deltaCents, previousSpent),
        };
      })
      .filter((change) => change.deltaCents > 0)
      .sort((left, right) => right.deltaCents - left.deltaCents || left.name.localeCompare(right.name, "pt-BR"))
      .slice(0, 3);
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
