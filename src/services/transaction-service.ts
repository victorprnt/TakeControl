import "server-only";

import { isDateOnly } from "@/lib/validations/records";
import { isMonthId } from "@/lib/validations/month-id";
import { DataAccessError } from "@/services/errors";
import type { CategoryRepository } from "@/services/repositories/category-repository";
import type { NewTransaction, TransactionRepository } from "@/services/repositories/transaction-repository";
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

  async create(input: NewTransaction): Promise<Transaction> {
    const next = await this.parse(input);
    return this.transactions.create(next);
  }

  private async parse(input: NewTransaction): Promise<NewTransaction> {
    const description = input.description.trim();

    if (!description) {
      throw new DataAccessError("A descrição da movimentação é obrigatória.", "invalid");
    }

    if (!Number.isInteger(input.amount) || input.amount <= 0) {
      throw new DataAccessError("O valor precisa ser um inteiro em centavos maior que zero.", "invalid");
    }

    if (!transactionTypes.includes(input.type)) {
      throw new DataAccessError("O tipo da movimentação é inválido.", "invalid");
    }

    if (!isDateOnly(input.date)) {
      throw new DataAccessError("A data da movimentação é inválida.", "invalid");
    }

    await this.ensureCategory(input.type, input.categoryId);

    const notes = input.notes?.trim();

    if (input.notes !== undefined && !notes) {
      throw new DataAccessError("A observação não pode ficar vazia.", "invalid");
    }

    return {
      description,
      amount: input.amount,
      type: input.type,
      categoryId: input.categoryId,
      date: input.date,
      ...(notes ? { notes } : {}),
    };
  }

  private async ensureCategory(type: TransactionType, categoryId: string | null): Promise<void> {
    if (type === "expense" && !categoryId) {
      throw new DataAccessError("Uma despesa precisa de uma categoria.", "invalid");
    }

    if (!categoryId) {
      return;
    }

    const category = await this.categories.findById(categoryId);

    if (!category) {
      throw new DataAccessError("Categoria não encontrada.", "not_found", 404);
    }

    if (!category.isActive) {
      throw new DataAccessError("A categoria não está ativa.", "conflict");
    }
  }
}

export function isInMonth(date: string, monthId: MonthId): boolean {
  return date.startsWith(`${monthId}-`);
}
