import "server-only";

import { isDateOnly } from "@/lib/validations/records";
import { DataAccessError } from "@/services/errors";
import type { CategoryRepository } from "@/services/repositories/category-repository";
import type { NewRecurringExpense, RecurringExpenseRepository } from "@/services/repositories/recurring-expense-repository";
import type { RecurringExpense, RecurringFrequency } from "@/types/recurring-expense";

const frequencies = ["weekly", "monthly", "yearly"] as const satisfies readonly RecurringFrequency[];

export class RecurringExpenseService {
  constructor(
    private readonly recurringExpenses: RecurringExpenseRepository,
    private readonly categories: CategoryRepository,
  ) {}

  async listActive(): Promise<RecurringExpense[]> {
    const expenses = await this.recurringExpenses.list();
    return expenses.filter((expense) => expense.isActive);
  }

  async create(input: NewRecurringExpense): Promise<RecurringExpense> {
    return this.recurringExpenses.create(await this.parse(input));
  }

  private async parse(input: NewRecurringExpense): Promise<NewRecurringExpense> {
    const description = input.description.trim();

    if (!description) {
      throw new DataAccessError("A descrição da recorrência é obrigatória.", "invalid");
    }

    if (!Number.isInteger(input.amount) || input.amount <= 0) {
      throw new DataAccessError("O valor precisa ser um inteiro em centavos maior que zero.", "invalid");
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

    if (!category.isActive) {
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
