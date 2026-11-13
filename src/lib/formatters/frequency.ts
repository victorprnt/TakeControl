import type { RecurringFrequency } from "@/types/recurring-expense";

const labels: Record<RecurringFrequency, string> = {
  weekly: "Toda semana",
  monthly: "Todo mês",
  yearly: "Todo ano",
};

export function formatFrequency(frequency: RecurringFrequency): string {
  return labels[frequency];
}