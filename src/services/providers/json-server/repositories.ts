import "server-only";

import type { MonthId } from "@/types/month";
import { DataAccessError } from "@/services/errors";
import type { Repositories } from "@/services/repositories";
import type { NewCategory } from "@/services/repositories/category-repository";
import type { NewCategoryBudget } from "@/services/repositories/category-budget-repository";
import type { NewMonthlyBudget } from "@/services/repositories/monthly-budget-repository";
import type { FixedBillPatch, NewFixedBill } from "@/services/repositories/fixed-bill-repository";
import type { NewRecurringExpense, RecurringExpensePatch } from "@/services/repositories/recurring-expense-repository";
import type { NewTransaction, TransactionPatch } from "@/services/repositories/transaction-repository";
import { JsonServerClient } from "@/services/providers/json-server/client";
import {
  parseCategories,
  parseCategory,
  parseCategoryBudget,
  parseCategoryBudgets,
  parseMonthlyBudget,
  parseMonthlyBudgets,
  parseFixedBill,
  parseFixedBills,
  parseRecurringExpense,
  parseRecurringExpenses,
  parseTransaction,
  parseTransactions,
} from "@/services/providers/json-server/parse";

function stamp<T extends object>(input: T): T & { id: string; createdAt: string; updatedAt: string } {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
}

/** JSON Server crashes on delete when a foreign key such as categoryId is null. */
function withoutNullCategory<T extends { categoryId?: string | null; notes?: string | null }>(record: T) {
  return {
    ...record,
    categoryId: record.categoryId || undefined,
    notes: record.notes || undefined,
  };
}

function withUpdate<T extends object>(input: T): T & { updatedAt: string } {
  return {
    ...input,
    updatedAt: new Date().toISOString(),
  };
}

export function createJsonServerRepositories(client: JsonServerClient): Repositories {
  return {
    categories: {
      list() {
        return client.get("/categories", parseCategories);
      },
      findById(id) {
        return client.getOrNull(`/categories/${encodeURIComponent(id)}`, parseCategory);
      },
      create(input: NewCategory) {
        return client.post("/categories", stamp(input), parseCategory);
      },
      async update(id, input: Partial<NewCategory>) {
        const current = await client.getOrNull(`/categories/${encodeURIComponent(id)}`, parseCategory);

        if (!current) {
          throw new DataAccessError("Registro não encontrado.", "not_found", 404);
        }

        return client.patch(`/categories/${encodeURIComponent(id)}`, withUpdate(input), parseCategory);
      },
    },
    monthlyBudgets: {
      list() {
        return client.get("/monthlyBudgets", parseMonthlyBudgets);
      },
      findById(id) {
        return client.getOrNull(`/monthlyBudgets/${encodeURIComponent(id)}`, parseMonthlyBudget);
      },
      async findByMonth(month: MonthId) {
        const matches = await client.get(`/monthlyBudgets?month=${encodeURIComponent(month)}`, parseMonthlyBudgets);

        if (matches.length > 1) {
          throw new DataAccessError("Há mais de um orçamento para o mesmo mês.", "conflict");
        }

        return matches[0] ?? null;
      },
      create(input: NewMonthlyBudget) {
        return client.post("/monthlyBudgets", stamp(input), parseMonthlyBudget);
      },
      async update(id, input: Partial<NewMonthlyBudget>) {
        const current = await client.getOrNull(`/monthlyBudgets/${encodeURIComponent(id)}`, parseMonthlyBudget);

        if (!current) {
          throw new DataAccessError("Registro não encontrado.", "not_found", 404);
        }

        return client.patch(`/monthlyBudgets/${encodeURIComponent(id)}`, withUpdate(input), parseMonthlyBudget);
      },
    },
    categoryBudgets: {
      list() {
        return client.get("/categoryBudgets", parseCategoryBudgets);
      },
      listByMonthlyBudget(monthlyBudgetId) {
        return client.get(
          `/categoryBudgets?monthlyBudgetId=${encodeURIComponent(monthlyBudgetId)}`,
          parseCategoryBudgets,
        );
      },
      findById(id) {
        return client.getOrNull(`/categoryBudgets/${encodeURIComponent(id)}`, parseCategoryBudget);
      },
      create(input: NewCategoryBudget) {
        return client.post("/categoryBudgets", stamp(input), parseCategoryBudget);
      },
      async update(id, input: Partial<NewCategoryBudget>) {
        const current = await client.getOrNull(`/categoryBudgets/${encodeURIComponent(id)}`, parseCategoryBudget);

        if (!current) {
          throw new DataAccessError("Registro não encontrado.", "not_found", 404);
        }

        return client.patch(`/categoryBudgets/${encodeURIComponent(id)}`, withUpdate(input), parseCategoryBudget);
      },
    },
    transactions: {
      list() {
        return client.get("/transactions", parseTransactions);
      },
      async listByMonth(month: MonthId) {
        const params = new URLSearchParams({
          date_gte: `${month}-01`,
          date_lte: `${month}-31`,
        });
        const matches = await client.get(`/transactions?${params.toString()}`, parseTransactions);
        return matches.filter((transaction) => transaction.date.startsWith(`${month}-`));
      },
      findById(id) {
        return client.getOrNull(`/transactions/${encodeURIComponent(id)}`, parseTransaction);
      },
      create(input: NewTransaction) {
        return client.post("/transactions", withoutNullCategory(stamp(input)), parseTransaction);
      },
      async update(id, input: TransactionPatch) {
        const current = await client.getOrNull(`/transactions/${encodeURIComponent(id)}`, parseTransaction);

        if (!current) {
          throw new DataAccessError("Registro não encontrado.", "not_found", 404);
        }

        const next = withoutNullCategory({
          ...current,
          ...input,
          id: current.id,
          createdAt: current.createdAt,
          updatedAt: new Date().toISOString(),
        });

        return client.put(`/transactions/${encodeURIComponent(id)}`, next, parseTransaction);
      },
      async delete(id) {
        const current = await client.getOrNull(`/transactions/${encodeURIComponent(id)}`, parseTransaction);

        if (!current) {
          throw new DataAccessError("Registro não encontrado.", "not_found", 404);
        }

        await client.delete(`/transactions/${encodeURIComponent(id)}`);
      },
    },
    recurringExpenses: {
      list() {
        return client.get("/recurringExpenses", parseRecurringExpenses);
      },
      findById(id) {
        return client.getOrNull(`/recurringExpenses/${encodeURIComponent(id)}`, parseRecurringExpense);
      },
      create(input: NewRecurringExpense) {
        return client.post("/recurringExpenses", stamp(input), parseRecurringExpense);
      },
      async update(id, input: RecurringExpensePatch) {
        const current = await client.getOrNull(
          `/recurringExpenses/${encodeURIComponent(id)}`,
          parseRecurringExpense,
        );

        if (!current) {
          throw new DataAccessError("Registro não encontrado.", "not_found", 404);
        }

        return client.patch(`/recurringExpenses/${encodeURIComponent(id)}`, withUpdate(input), parseRecurringExpense);
      },
    },
    fixedBills: {
      list() {
        return client.get("/fixedBills", parseFixedBills);
      },
      create(input: NewFixedBill) {
        return client.post("/fixedBills", stamp(input), parseFixedBill);
      },
      async update(id, input: FixedBillPatch) {
        const current = await client.getOrNull(`/fixedBills/${encodeURIComponent(id)}`, parseFixedBill);

        if (!current) {
          throw new DataAccessError("Registro não encontrado.", "not_found", 404);
        }

        return client.patch(`/fixedBills/${encodeURIComponent(id)}`, withUpdate(input), parseFixedBill);
      },
    },
  };
}
