import type { Cents } from "@/types/money";

export type OccurrenceStatus = "posted" | "pending";

/** A date produced by a recurring rule. Pending rows are not transactions yet. */
export type RecurringOccurrence = {
  recurringExpenseId: string;
  description: string;
  amountCents: Cents;
  categoryName: string;
  date: string;
  status: OccurrenceStatus;
  transactionId: string | null;
};

export type SkippedOccurrence = {
  description: string;
  date: string;
  reason: string;
};

/** Result of an idempotent generation pass for one month. */
export type OccurrenceGeneration = {
  created: number;
  alreadyPosted: number;
  skipped: SkippedOccurrence[];
};
