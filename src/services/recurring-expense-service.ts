import "server-only";

import { getNextMonth, monthDateRange } from "@/lib/formatters";
import { isDateOnly } from "@/lib/validations/records";
import { isMonthId } from "@/lib/validations/month-id";
import { occurrenceDates } from "@/services/recurrence-schedule";
import { DataAccessError, toUserMessage } from "@/services/errors";
import type { CategoryRepository } from "@/services/repositories/category-repository";
import type {
  NewRecurringExpense,
  RecurringExpensePatch,
  RecurringExpenseRepository,
} from "@/services/repositories/recurring-expense-repository";
import type { TransactionService } from "@/services/transaction-service";
import type { Category } from "@/types/category";
import type { OccurrenceGeneration, RecurringOccurrence } from "@/types/recurring-occurrence";
import type { RecurringExpense, RecurringFrequency } from "@/types/recurring-expense";

const frequencies = ["weekly", "monthly", "yearly"] as const satisfies readonly RecurringFrequency[];

export class RecurringExpenseService {
  constructor(
    private readonly recurringExpenses: RecurringExpenseRepository,
    private readonly categories: CategoryRepository,
    private readonly transactions: TransactionService,
  ) {}

  list(): Promise<RecurringExpense[]> {
    return this.recurringExpenses.list();
  }

  async listActive(): Promise<RecurringExpense[]> {
    const expenses = await this.recurringExpenses.list();
    return expenses.filter((expense) => expense.isActive);
  }

  async create(input: NewRecurringExpense): Promise<RecurringExpense> {
    return this.recurringExpenses.create(await this.parse(input, true));
  }

  async update(id: string, input: RecurringExpensePatch): Promise<RecurringExpense> {
    const current = await this.recurringExpenses.findById(id);

    if (!current) {
      throw new DataAccessError("Recorrência não encontrada.", "not_found", 404);
    }

    const endDate = input.endDate === undefined ? current.endDate : (input.endDate ?? undefined);
    const next = await this.parse(
      {
        description: input.description ?? current.description,
        amount: input.amount ?? current.amount,
        categoryId: input.categoryId ?? current.categoryId,
        frequency: input.frequency ?? current.frequency,
        startDate: input.startDate ?? current.startDate,
        ...(endDate ? { endDate } : {}),
        isActive: input.isActive ?? current.isActive,
      },
      input.categoryId !== undefined && input.categoryId !== current.categoryId,
    );

    return this.recurringExpenses.update(id, {
      ...next,
      endDate: next.endDate ?? null,
    });
  }

  /**
   * Posts missing occurrences for the month. An existing period is left as the user saved it.
   * Loading a screen does not call this.
   */
  async generateMonth(monthId: string, ruleId?: string): Promise<OccurrenceGeneration> {
    if (!isMonthId(monthId)) {
      throw new DataAccessError("O mês precisa estar no formato AAAA-MM.", "invalid");
    }

    const range = monthDateRange(monthId);
    const all = await this.recurringExpenses.list();
    const rules = all.filter((rule) => rule.isActive && (ruleId === undefined || rule.id === ruleId));
    const result: OccurrenceGeneration = { created: 0, alreadyPosted: 0, skipped: [] };

    if (ruleId && rules.length === 0) {
      const rule = all.find((item) => item.id === ruleId);

      if (!rule) {
        throw new DataAccessError("Recorrência não encontrada.", "not_found", 404);
      }

      result.skipped.push({
        description: rule.description,
        date: range.start,
        reason: "A recorrência está inativa.",
      });
      return result;
    }

    for (const rule of rules) {
      for (const date of occurrenceDates(rule, range.start, range.end)) {
        try {
          const outcome = await this.transactions.createOccurrence({
            description: rule.description,
            amount: rule.amount,
            type: "expense",
            categoryId: rule.categoryId,
            date,
            recurringExpenseId: rule.id,
            occurrenceDate: date,
          });

          if (outcome.created) {
            result.created += 1;
          } else {
            result.alreadyPosted += 1;
          }
        } catch (error) {
          result.skipped.push({ description: rule.description, date, reason: toUserMessage(error) });
        }
      }
    }

    return result;
  }

  /** Upcoming and already posted dates from the selected month through the two months after it. */
  async preview(monthId: string): Promise<RecurringOccurrence[]> {
    if (!isMonthId(monthId)) {
      throw new DataAccessError("O mês precisa estar no formato AAAA-MM.", "invalid");
    }

    const start = monthDateRange(monthId).start;
    const end = monthDateRange(getNextMonth(getNextMonth(monthId))).end;
    const [rules, categories, transactions] = await Promise.all([
      this.listActive(),
      this.categories.list(),
      this.transactions.list(),
    ]);
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const occurrences: RecurringOccurrence[] = [];

    for (const rule of rules) {
      for (const date of occurrenceDates(rule, start, end)) {
        const posted = transactions.find(
          (transaction) => transaction.recurringExpenseId === rule.id && transaction.occurrenceDate === date,
        );

        occurrences.push({
          recurringExpenseId: rule.id,
          description: posted?.description ?? rule.description,
          amountCents: posted?.amount ?? rule.amount,
          categoryName: this.categoryName(categoryById, rule.categoryId),
          date,
          status: posted ? "posted" : "pending",
          transactionId: posted?.id ?? null,
        });
      }
    }

    return occurrences.sort(
      (left, right) => left.date.localeCompare(right.date) || left.description.localeCompare(right.description, "pt-BR"),
    );
  }

  private categoryName(categories: Map<string, Category>, categoryId: string): string {
    return categories.get(categoryId)?.name ?? "Sem categoria";
  }

  private async parse(input: NewRecurringExpense, requireActiveCategory: boolean): Promise<NewRecurringExpense> {
    const description = input.description.trim();

    if (!description) {
      throw new DataAccessError("A descrição da recorrência é obrigatória.", "invalid");
    }

    if (!Number.isInteger(input.amount) || input.amount <= 0) {
      throw new DataAccessError("O valor precisa ser maior que zero.", "invalid");
    }

    if (!frequencies.includes(input.frequency)) {
      throw new DataAccessError("A frequência da recorrência é inválida.", "invalid");
    }

    if (!isDateOnly(input.startDate)) {
      throw new DataAccessError("A data inicial da recorrência é inválida.", "invalid");
    }

    if (input.endDate !== undefined && !isDateOnly(input.endDate)) {
      throw new DataAccessError("A data final da recorrência é inválida.", "invalid");
    }

    if (input.endDate && input.endDate < input.startDate) {
      throw new DataAccessError("A data final não pode ser anterior à data inicial.", "invalid");
    }

    if (typeof input.isActive !== "boolean") {
      throw new DataAccessError("Informe se a recorrência está ativa.", "invalid");
    }

    const category = await this.categories.findById(input.categoryId);

    if (!category) {
      throw new DataAccessError("Categoria não encontrada.", "not_found", 404);
    }

    if (requireActiveCategory && !category.isActive) {
      throw new DataAccessError("A categoria não está ativa.", "conflict");
    }

    return {
      description,
      amount: input.amount,
      categoryId: input.categoryId,
      frequency: input.frequency,
      startDate: input.startDate,
      ...(input.endDate ? { endDate: input.endDate } : {}),
      isActive: input.isActive,
    };
  }
}
