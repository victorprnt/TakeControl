import type { Cents } from "@/types/money";
import type { MonthId } from "@/types/month";

/** A household bill for one month. Amounts are integer cents. */
export type FixedBill = {
  id: string;
  name: string;
  icon: string;
  amount: Cents;
  paid: boolean;
  month: MonthId;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
