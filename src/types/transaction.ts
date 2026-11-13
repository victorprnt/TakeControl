import type { Cents } from "@/types/money";

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  description: string;
  /** Integer cents. Always positive; `type` gives the direction. */
  amount: Cents;
  type: TransactionType;
  categoryId: string | null;
  /** Calendar date, YYYY-MM-DD, in America/Fortaleza. */
  date: string;
  notes?: string;
  /** Set when this row was generated from a recurring rule. */
  recurringExpenseId?: string;
  /** Scheduled date of that occurrence. Stays put if the user edits the transaction date. */
  occurrenceDate?: string;
  createdAt: string;
  updatedAt: string;
};
