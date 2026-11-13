import type { FixedBill } from "@/types/fixed-bill";
import type { Cents } from "@/types/money";
import type { MonthId } from "@/types/month";

export type NewFixedBill = {
  name: string;
  icon: string;
  amount: Cents;
  paid: boolean;
  month: MonthId;
  sortOrder: number;
};

export type FixedBillPatch = {
  amount?: Cents;
  paid?: boolean;
};

export interface FixedBillRepository {
  list(): Promise<FixedBill[]>;
  create(input: NewFixedBill): Promise<FixedBill>;
  update(id: string, input: FixedBillPatch): Promise<FixedBill>;
}
