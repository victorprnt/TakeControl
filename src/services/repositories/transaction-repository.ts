import type { MonthId } from "@/types/month";
import type { Transaction, TransactionType } from "@/types/transaction";

export type NewTransaction = {
  description: string;
  amount: Transaction["amount"];
  type: TransactionType;
  categoryId: string | null;
  date: string;
  notes?: string;
  recurringExpenseId?: string;
  occurrenceDate?: string;
};

export type TransactionPatch = {
  description?: string;
  amount?: Transaction["amount"];
  type?: TransactionType;
  categoryId?: string | null;
  date?: string;
  notes?: string | null;
};

export interface TransactionRepository {
  list(): Promise<Transaction[]>;
  listByMonth(month: MonthId): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
  create(input: NewTransaction): Promise<Transaction>;
  update(id: string, input: TransactionPatch): Promise<Transaction>;
  delete(id: string): Promise<void>;
}
