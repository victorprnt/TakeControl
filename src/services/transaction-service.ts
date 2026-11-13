import "server-only";

import { monthDateRange, toDateOnly } from "@/lib/formatters";
import { isDateOnly } from "@/lib/validations/records";
import { isMonthId } from "@/lib/validations/month-id";
import { DataAccessError } from "@/services/errors";
import type { CategoryRepository } from "@/services/repositories/category-repository";
import type {
  NewTransaction,
  TransactionPatch,
  TransactionRepository,
} from "@/services/repositories/transaction-repository";
import type { Category } from "@/types/category";
import type { MonthId } from "@/types/month";
import type { Transaction, TransactionType } from "@/types/transaction";

const transactionTypes = ["income", "expense"] as const satisfies readonly TransactionType[];

export class TransactionService {
  constructor(
    private readonly transactions: TransactionRepository,
    private readonly categories: CategoryRepository,
  ) {}

  list(): Promise<Transaction[]> {
    return this.transactions.list();
  }

  async listForMonth(month: string): Promise<Transaction[]> {
    if (!isMonthId(month)) {
      throw new DataAccessError("O mês precisa estar no formato AAAA-MM.", "invalid");
    }

    return this.transactions.listByMonth(month);
  }

  async findById(id: string): Promise<Transaction> {
    const transaction = await this.transactions.findById(id);

    if (!transaction) {
      throw new DataAccessError("Movimentação não encontrada.", "not_found", 404);
    }

    return transaction;
  }

  async create(input: NewTransaction): Promise<Transaction> {
    const next = await this.parse(input, { requireActiveCategory: true });
    return this.transactions.create(next);
  }

  /**
   * Adds one amount to an envelope. The row is stored with the movements
   * and is not listed on the dashboard.
   */
  async addToEnvelope(categoryId: string, monthId: string, amount: number): Promise<Transaction> {
    if (!isMonthId(monthId)) {
      throw new DataAccessError("O mês precisa estar no formato AAAA-MM.", "invalid");
    }

    const category = await this.categories.findById(categoryId);

    if (!category) {
      throw new DataAccessError("Categoria não encontrada.", "not_found", 404);
    }

    if (!category.isActive) {
      throw new DataAccessError("A categoria não está ativa.", "conflict");
    }

    const today = toDateOnly();
    const range = monthDateRange(monthId);

    return this.create({
      description: category.name,
      amount,
      type: "expense",
      categoryId,
      date: today >= range.start && today <= range.end ? today : range.start,
    });
  }

  /**
   * Posts one occurrence. When that period already exists, the saved transaction
   * is returned unchanged so a second pass does not duplicate or overwrite it.
   */
  async createOccurrence(input: NewTransaction): Promise<{ transaction: Transaction; created: boolean }> {
    const next = await this.parse(input, { requireActiveCategory: true });

    if (!next.recurringExpenseId || !next.occurrenceDate) {
      throw new DataAccessError("A ocorrência da recorrência está incompleta.", "invalid");
    }

    const existing = await this.findOccurrence(next.recurringExpenseId, next.occurrenceDate);

    if (existing) {
      return { transaction: existing, created: false };
    }

    return { transaction: await this.transactions.create(next), created: true };
  }

  async update(id: string, input: TransactionPatch): Promise<Transaction> {
    const current = await this.findById(id);
    const next = await this.parse(
      {
        description: input.description ?? current.description,
        amount: input.amount ?? current.amount,
        type: current.recurringExpenseId ? "expense" : (input.type ?? current.type),
        categoryId: input.categoryId === undefined ? current.categoryId : input.categoryId,
        date: input.date ?? current.date,
        notes: input.notes === undefined ? current.notes : (input.notes ?? undefined),
      },
      {
        requireActiveCategory: input.categoryId !== undefined && input.categoryId !== current.categoryId,
      },
    );

    return this.transactions.update(id, {
      description: next.description,
      amount: next.amount,
      type: next.type,
      categoryId: next.categoryId,
      date: next.date,
      notes: next.notes ?? null,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.transactions.delete(id);
  }

  async findOccurrence(recurringExpenseId: string, occurrenceDate: string): Promise<Transaction | null> {
    const matches = (await this.transactions.list()).filter(
      (transaction) =>
        transaction.recurringExpenseId === recurringExpenseId && transaction.occurrenceDate === occurrenceDate,
    );

    if (matches.length > 1) {
      throw new DataAccessError("Esta recorrência já tem mais de um lançamento neste período.", "conflict");
    }

    return matches[0] ?? null;
  }

  private async parse(
    input: NewTransaction,
    options: { requireActiveCategory: boolean },
  ): Promise<NewTransaction> {
    const description = input.description.trim();

    if (!description) {
      throw new DataAccessError("A descrição é obrigatória.", "invalid");
    }

    if (!Number.isInteger(input.amount) || input.amount <= 0) {
      throw new DataAccessError("O valor precisa ser maior que zero.", "invalid");
    }

    if (!transactionTypes.includes(input.type)) {
      throw new DataAccessError("O tipo da movimentação é inválido.", "invalid");
    }

    if (!isDateOnly(input.date)) {
      throw new DataAccessError("A data é inválida.", "invalid");
    }

    const categoryId = input.categoryId?.trim() ? input.categoryId : null;
    await this.ensureCategory(input.type, categoryId, options.requireActiveCategory);

    const notes = input.notes?.trim();

    if (input.notes !== undefined && input.notes !== null && !notes) {
      throw new DataAccessError("A observação não pode ficar vazia.", "invalid");
    }

    const linked = Boolean(input.recurringExpenseId) || Boolean(input.occurrenceDate);

    if (linked && (!input.recurringExpenseId || !input.occurrenceDate || !isDateOnly(input.occurrenceDate))) {
      throw new DataAccessError("A ocorrência da recorrência está incompleta.", "invalid");
    }

    if (linked && input.type !== "expense") {
      throw new DataAccessError("Uma ocorrência de recorrência é uma despesa.", "invalid");
    }

    return {
      description,
      amount: input.amount,
      type: input.type,
      categoryId,
      date: input.date,
      ...(notes ? { notes } : {}),
      ...(input.recurringExpenseId && input.occurrenceDate
        ? { recurringExpenseId: input.recurringExpenseId, occurrenceDate: input.occurrenceDate }
        : {}),
    };
  }

  private async ensureCategory(
    type: TransactionType,
    categoryId: string | null,
    requireActive: boolean,
  ): Promise<void> {
    if (type === "expense" && !categoryId) {
      throw new DataAccessError("Uma despesa precisa de uma categoria.", "invalid");
    }

    if (!categoryId) {
      return;
    }

    const category = await this.categories.findById(categoryId);
    this.assertCategory(category, requireActive);
  }

  private assertCategory(category: Category | null, requireActive: boolean): void {
    if (!category) {
      throw new DataAccessError("Categoria não encontrada.", "not_found", 404);
    }

    if (requireActive && !category.isActive) {
      throw new DataAccessError("A categoria não está ativa.", "conflict");
    }
  }
}

export function isInMonth(date: string, monthId: MonthId): boolean {
  return date.startsWith(`${monthId}-`);
}
