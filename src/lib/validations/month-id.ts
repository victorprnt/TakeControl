import type { MonthId } from "@/types/month";

const MONTH_ID_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isMonthId(value: string): value is MonthId {
  return MONTH_ID_PATTERN.test(value);
}

export function parseMonthId(value: string): { year: number; month: number } {
  const match = MONTH_ID_PATTERN.exec(value);

  if (!match?.[1] || !match[2]) {
    throw new Error(`Invalid month identifier: ${value}. Expected YYYY-MM.`);
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
}
