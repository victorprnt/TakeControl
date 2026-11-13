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
  createdAt: string;
  updatedAt: string;
};
