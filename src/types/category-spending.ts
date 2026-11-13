import type { Cents } from "@/types/money";
import type { MonthId } from "@/types/month";

export type CategorySpendingMonth = {
  monthId: MonthId;
  allocatedCents: Cents;
  spentCents: Cents;
};
