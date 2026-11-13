import type { Cents } from "@/types/money";
import type { MonthId } from "@/types/month";

export type AllocationSource = "previous" | "default" | "saved";

export type MonthAllocationDraft = {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  allocatedCents: Cents;
  source: AllocationSource;
};

/** Suggestion or saved plan for one month. Nothing here is written until the user saves. */
export type MonthPlan = {
  monthId: MonthId;
  alreadySaved: boolean;
  incomeCents: Cents;
  allocations: MonthAllocationDraft[];
};

export type MonthAllocationInput = {
  categoryId: string;
  allocatedCents: Cents;
};
