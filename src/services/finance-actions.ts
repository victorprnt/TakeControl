"use server";

import { toUserMessage } from "@/services/errors";
import { getServices } from "@/services";
import type { NewCategory } from "@/services/repositories/category-repository";
import type { NewRecurringExpense, RecurringExpensePatch } from "@/services/repositories/recurring-expense-repository";
import type { Category } from "@/types/category";
import type { CategorySpendingMonth } from "@/types/category-spending";
import type { MonthAllocationInput, MonthPlan } from "@/types/month-plan";
import type { MonthId } from "@/types/month";
import type { OccurrenceGeneration, RecurringOccurrence } from "@/types/recurring-occurrence";
import type { RecurringExpense } from "@/types/recurring-expense";
import type { FixedBill } from "@/types/fixed-bill";
import type { Transaction, TransactionType } from "@/types/transaction";

export type TransactionWrite = {
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string | null;
  date: string;
  notes?: string | null;
};

type ActionResult<T> = { ok: true; data: T } | { ok: false; message: string };

async function run<T>(work: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await work() };
  } catch (error) {
    console.error(error);
    return { ok: false, message: toUserMessage(error) };
  }
}

export async function loadCategories(): Promise<ActionResult<Category[]>> {
  return run(() => getServices().categories.list());
}

export async function saveCategory(input: NewCategory): Promise<ActionResult<Category>> {
  return run(() => getServices().categories.create(input));
}

export async function updateCategory(
  id: string,
  input: Partial<NewCategory>,
): Promise<ActionResult<Category>> {
  return run(() => getServices().categories.update(id, input));
}

export async function loadCategorySpending(categoryId: string): Promise<ActionResult<CategorySpendingMonth[]>> {
  return run(() => getServices().budgets.getCategorySpending(categoryId));
}

export async function prepareMonthPlan(monthId: string): Promise<ActionResult<MonthPlan>> {
  return run(() => getServices().budgets.prepareMonth(monthId));
}

export async function saveMonthPlan(
  monthId: string,
  incomeCents: number,
  allocations: MonthAllocationInput[],
): Promise<ActionResult<MonthId>> {
  return run(() => getServices().budgets.saveMonth(monthId, incomeCents, allocations));
}

export async function saveMonthIncome(monthId: string, incomeCents: number): Promise<ActionResult<null>> {
  return run(async () => {
    await getServices().budgets.updateIncome(monthId, incomeCents);
    return null;
  });
}

export async function saveCategoryAllocation(
  monthId: string,
  categoryId: string,
  allocatedCents: number,
): Promise<ActionResult<null>> {
  return run(async () => {
    await getServices().budgets.updateAllocation(monthId, categoryId, allocatedCents);
    return null;
  });
}

export async function applyReceivedIncome(monthId: string): Promise<ActionResult<number>> {
  return run(() => getServices().budgets.applyReceivedIncome(monthId));
}

export async function loadTransactions(): Promise<ActionResult<Transaction[]>> {
  return run(() => getServices().transactions.list());
}

export async function addEnvelopeSpend(
  categoryId: string,
  monthId: string,
  amountCents: number,
): Promise<ActionResult<Transaction>> {
  return run(() => getServices().transactions.addToEnvelope(categoryId, monthId, amountCents));
}

export async function updateFixedBill(
  id: string,
  input: { amount?: number; paid?: boolean },
): Promise<ActionResult<FixedBill>> {
  return run(() => getServices().bills.update(id, input));
}

export async function addFixedBill(
  monthId: string,
  name: string,
  amountCents: number,
): Promise<ActionResult<FixedBill>> {
  return run(() => getServices().bills.add(monthId, { name, amount: amountCents }));
}

export async function deleteFixedBill(id: string): Promise<ActionResult<null>> {
  return run(async () => {
    await getServices().bills.remove(id);
    return null;
  });
}

export async function saveTransaction(input: TransactionWrite): Promise<ActionResult<Transaction>> {
  return run(() =>
    getServices().transactions.create({
      description: input.description,
      amount: input.amount,
      type: input.type,
      categoryId: input.categoryId,
      date: input.date,
      ...(input.notes ? { notes: input.notes } : {}),
    }),
  );
}

export async function updateTransaction(id: string, input: TransactionWrite): Promise<ActionResult<Transaction>> {
  return run(() =>
    getServices().transactions.update(id, {
      description: input.description,
      amount: input.amount,
      type: input.type,
      categoryId: input.categoryId,
      date: input.date,
      notes: input.notes?.trim() ? input.notes : null,
    }),
  );
}

export async function deleteTransaction(id: string): Promise<ActionResult<null>> {
  return run(async () => {
    await getServices().transactions.remove(id);
    return null;
  });
}

export async function loadRecurringExpenses(): Promise<ActionResult<RecurringExpense[]>> {
  return run(() => getServices().recurring.list());
}

export async function saveRecurringExpense(input: NewRecurringExpense): Promise<ActionResult<RecurringExpense>> {
  return run(() => getServices().recurring.create(input));
}

export async function updateRecurringExpense(
  id: string,
  input: RecurringExpensePatch,
): Promise<ActionResult<RecurringExpense>> {
  return run(() => getServices().recurring.update(id, input));
}

export async function loadOccurrencePreview(monthId: string): Promise<ActionResult<RecurringOccurrence[]>> {
  return run(() => getServices().recurring.preview(monthId));
}

export async function generateMonthOccurrences(
  monthId: string,
  ruleId?: string,
): Promise<ActionResult<OccurrenceGeneration>> {
  return run(() => getServices().recurring.generateMonth(monthId, ruleId));
}
