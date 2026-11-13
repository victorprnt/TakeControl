import { isMonthId } from "@/lib/validations/month-id";
import {
  readBoolean,
  readCents,
  readDateOnly,
  readEnum,
  readHexColor,
  readNullableId,
  readOptionalString,
  readRecord,
  readString,
  readTimestamp,
} from "@/lib/validations/records";
import type { CategoryBudget } from "@/types/category-budget";
import type { Category } from "@/types/category";
import type { MonthlyBudget } from "@/types/monthly-budget";
import type { RecurringExpense, RecurringFrequency } from "@/types/recurring-expense";
import type { Transaction, TransactionType } from "@/types/transaction";

const transactionTypes = ["income", "expense"] as const satisfies readonly TransactionType[];
const frequencies = ["weekly", "monthly", "yearly"] as const satisfies readonly RecurringFrequency[];

function parseList<T>(value: unknown, parseItem: (item: unknown) => T): T[] {
  if (!Array.isArray(value)) {
    throw new Error("Expected an array.");
  }

  return value.map(parseItem);
}

export function parseCategory(value: unknown): Category {
  const record = readRecord(value);
  const description = readOptionalString(record.description, "description");

  return {
    id: readString(record.id, "id"),
    name: readString(record.name, "name"),
    icon: readString(record.icon, "icon"),
    color: readHexColor(record.color, "color"),
    ...(description ? { description } : {}),
    defaultBudget: readCents(record.defaultBudget, "defaultBudget"),
    isActive: readBoolean(record.isActive, "isActive"),
    createdAt: readTimestamp(record.createdAt, "createdAt"),
    updatedAt: readTimestamp(record.updatedAt, "updatedAt"),
  };
}

export function parseCategories(value: unknown): Category[] {
  return parseList(value, parseCategory);
}

export function parseMonthlyBudget(value: unknown): MonthlyBudget {
  const record = readRecord(value);
  const month = readString(record.month, "month");

  if (!isMonthId(month)) {
    throw new Error("Invalid month.");
  }

  return {
    id: readString(record.id, "id"),
    month,
    income: readCents(record.income, "income"),
    createdAt: readTimestamp(record.createdAt, "createdAt"),
    updatedAt: readTimestamp(record.updatedAt, "updatedAt"),
  };
}

export function parseMonthlyBudgets(value: unknown): MonthlyBudget[] {
  return parseList(value, parseMonthlyBudget);
}

export function parseCategoryBudget(value: unknown): CategoryBudget {
  const record = readRecord(value);

  return {
    id: readString(record.id, "id"),
    monthlyBudgetId: readString(record.monthlyBudgetId, "monthlyBudgetId"),
    categoryId: readString(record.categoryId, "categoryId"),
    allocatedAmount: readCents(record.allocatedAmount, "allocatedAmount"),
    createdAt: readTimestamp(record.createdAt, "createdAt"),
    updatedAt: readTimestamp(record.updatedAt, "updatedAt"),
  };
}

export function parseCategoryBudgets(value: unknown): CategoryBudget[] {
  return parseList(value, parseCategoryBudget);
}

function readOptionalId(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return readString(value, field);
}

export function parseTransaction(value: unknown): Transaction {
  const record = readRecord(value);
  const notes = readOptionalString(record.notes, "notes");
  const recurringExpenseId = readOptionalId(record.recurringExpenseId, "recurringExpenseId");
  const occurrenceDate =
    record.occurrenceDate === undefined || record.occurrenceDate === null || record.occurrenceDate === ""
      ? undefined
      : readDateOnly(record.occurrenceDate, "occurrenceDate");

  if (Boolean(recurringExpenseId) !== Boolean(occurrenceDate)) {
    throw new Error("Invalid occurrence link.");
  }

  return {
    id: readString(record.id, "id"),
    description: readString(record.description, "description"),
    amount: readCents(record.amount, "amount", 1),
    type: readEnum(record.type, "type", transactionTypes),
    categoryId:
      record.categoryId === undefined ? null : readNullableId(record.categoryId, "categoryId"),
    date: readDateOnly(record.date, "date"),
    ...(notes ? { notes } : {}),
    ...(recurringExpenseId && occurrenceDate ? { recurringExpenseId, occurrenceDate } : {}),
    createdAt: readTimestamp(record.createdAt, "createdAt"),
    updatedAt: readTimestamp(record.updatedAt, "updatedAt"),
  };
}

export function parseTransactions(value: unknown): Transaction[] {
  return parseList(value, parseTransaction);
}

export function parseRecurringExpense(value: unknown): RecurringExpense {
  const record = readRecord(value);
  const endDate = record.endDate === undefined || record.endDate === null ? undefined : readDateOnly(record.endDate, "endDate");

  return {
    id: readString(record.id, "id"),
    description: readString(record.description, "description"),
    amount: readCents(record.amount, "amount", 1),
    categoryId: readString(record.categoryId, "categoryId"),
    frequency: readEnum(record.frequency, "frequency", frequencies),
    startDate: readDateOnly(record.startDate, "startDate"),
    ...(endDate ? { endDate } : {}),
    isActive: readBoolean(record.isActive, "isActive"),
    createdAt: readTimestamp(record.createdAt, "createdAt"),
    updatedAt: readTimestamp(record.updatedAt, "updatedAt"),
  };
}

export function parseRecurringExpenses(value: unknown): RecurringExpense[] {
  return parseList(value, parseRecurringExpense);
}
