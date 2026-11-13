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
import type { FinanceDocument } from "@/services/providers/redis/document";
import {
  parseBillMonth,
  parseCategory,
  parseCategoryBudget,
  parseFixedBill,
  parseMonthlyBudget,
  parseRecurringExpense,
  parseTransaction,
} from "@/services/providers/json-server/parse";

type WithId = { id: string; createdAt: string };

function stamp<T extends object>(input: T): T & { id: string; createdAt: string; updatedAt: string } {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
}

function notFound(): never {
  throw new DataAccessError("Registro não encontrado.", "not_found", 404);
}

function merged<T extends WithId>(current: T, patch: object): unknown {
  return {
    ...current,
    ...patch,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

function replace<T extends { id: string }>(items: T[], id: string, next: T): T {
  const index = items.findIndex((item) => item.id === id);

  if (index < 0) {
    notFound();
  }

  items[index] = next;
  return next;
}

export type FinanceDocumentStore = {
  read(): Promise<FinanceDocument>;
  write(document: FinanceDocument): Promise<void>;
};

export function createRedisRepositories(store: FinanceDocumentStore): Repositories {
  async function readDocument() {
    return store.read();
  }

  async function change<T>(update: (document: FinanceDocument) => T): Promise<T> {
    const document = await store.read();
    const result = update(document);
    await store.write(document);
    return result;
  }

  return {
    categories: {
      async list() {
        return (await readDocument()).categories;
      },
      async findById(id) {
        return (await readDocument()).categories.find((item) => item.id === id) ?? null;
      },
      create(input: NewCategory) {
        return change((document) => {
          const created = parseCategory(stamp(input));
          document.categories.push(created);
          return created;
        });
      },
      update(id, input: Partial<NewCategory>) {
        return change((document) => {
          const current = document.categories.find((item) => item.id === id) ?? notFound();
          return replace(document.categories, id, parseCategory(merged(current, input)));
        });
      },
    },
    monthlyBudgets: {
      async list() {
        return (await readDocument()).monthlyBudgets;
      },
      async findById(id) {
        return (await readDocument()).monthlyBudgets.find((item) => item.id === id) ?? null;
      },
      async findByMonth(month: MonthId) {
        const matches = (await readDocument()).monthlyBudgets.filter((item) => item.month === month);

        if (matches.length > 1) {
          throw new DataAccessError("Há mais de um orçamento para o mesmo mês.", "conflict");
        }

        return matches[0] ?? null;
      },
      create(input: NewMonthlyBudget) {
        return change((document) => {
          const created = parseMonthlyBudget(stamp(input));
          document.monthlyBudgets.push(created);
          return created;
        });
      },
      update(id, input: Partial<NewMonthlyBudget>) {
        return change((document) => {
          const current = document.monthlyBudgets.find((item) => item.id === id) ?? notFound();
          return replace(document.monthlyBudgets, id, parseMonthlyBudget(merged(current, input)));
        });
      },
    },
    categoryBudgets: {
      async list() {
        return (await readDocument()).categoryBudgets;
      },
      async listByMonthlyBudget(monthlyBudgetId) {
        return (await readDocument()).categoryBudgets.filter((item) => item.monthlyBudgetId === monthlyBudgetId);
      },
      async findById(id) {
        return (await readDocument()).categoryBudgets.find((item) => item.id === id) ?? null;
      },
      create(input: NewCategoryBudget) {
        return change((document) => {
          const created = parseCategoryBudget(stamp(input));
          document.categoryBudgets.push(created);
          return created;
        });
      },
      update(id, input: Partial<NewCategoryBudget>) {
        return change((document) => {
          const current = document.categoryBudgets.find((item) => item.id === id) ?? notFound();
          return replace(document.categoryBudgets, id, parseCategoryBudget(merged(current, input)));
        });
      },
    },
    transactions: {
      async list() {
        return (await readDocument()).transactions;
      },
      async listByMonth(month: MonthId) {
        return (await readDocument()).transactions.filter((item) => item.date.startsWith(`${month}-`));
      },
      async findById(id) {
        return (await readDocument()).transactions.find((item) => item.id === id) ?? null;
      },
      create(input: NewTransaction) {
        return change((document) => {
          const created = parseTransaction(stamp(input));
          document.transactions.push(created);
          return created;
        });
      },
      update(id, input: TransactionPatch) {
        return change((document) => {
          const current = document.transactions.find((item) => item.id === id) ?? notFound();
          return replace(document.transactions, id, parseTransaction(merged(current, input)));
        });
      },
      delete(id) {
        return change((document) => {
          const index = document.transactions.findIndex((item) => item.id === id);

          if (index < 0) {
            notFound();
          }

          document.transactions.splice(index, 1);
        });
      },
    },
    recurringExpenses: {
      async list() {
        return (await readDocument()).recurringExpenses;
      },
      async findById(id) {
        return (await readDocument()).recurringExpenses.find((item) => item.id === id) ?? null;
      },
      create(input: NewRecurringExpense) {
        return change((document) => {
          const created = parseRecurringExpense(stamp(input));
          document.recurringExpenses.push(created);
          return created;
        });
      },
      update(id, input: RecurringExpensePatch) {
        return change((document) => {
          const current = document.recurringExpenses.find((item) => item.id === id) ?? notFound();
          return replace(document.recurringExpenses, id, parseRecurringExpense(merged(current, input)));
        });
      },
    },
    fixedBills: {
      async list() {
        return (await readDocument()).fixedBills;
      },
      create(input: NewFixedBill) {
        return change((document) => {
          const created = parseFixedBill(stamp(input));
          document.fixedBills.push(created);
          return created;
        });
      },
      update(id, input: FixedBillPatch) {
        return change((document) => {
          const current = document.fixedBills.find((item) => item.id === id) ?? notFound();
          return replace(document.fixedBills, id, parseFixedBill(merged(current, input)));
        });
      },
      delete(id) {
        return change((document) => {
          const index = document.fixedBills.findIndex((item) => item.id === id);

          if (index < 0) {
            notFound();
          }

          document.fixedBills.splice(index, 1);
        });
      },
      async listClearedMonths() {
        return (await readDocument()).billMonths.map((month) => month.month);
      },
      markMonthCleared(month) {
        return change((document) => {
          if (document.billMonths.some((item) => item.month === month)) {
            return;
          }

          document.billMonths.push(parseBillMonth(stamp({ month })));
        });
      },
    },
  };
}
