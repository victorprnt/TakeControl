import type { RecurringExpense } from "@/types/recurring-expense";

function parts(value: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match?.[1] || !match[2] || !match[3]) {
    throw new Error(`Invalid calendar date: ${value}.`);
  }

  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function format(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function addDays(value: string, days: number): string {
  const { year, month, day } = parts(value);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return format(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

function daysBetween(start: string, end: string): number {
  const from = parts(start);
  const to = parts(end);
  const milliseconds =
    Date.UTC(to.year, to.month - 1, to.day) - Date.UTC(from.year, from.month - 1, from.day);
  return Math.round(milliseconds / 86_400_000);
}

/** Same day-of-month as the anchor, clamped when the target month is shorter. */
function shiftMonths(anchor: string, monthsToAdd: number): string {
  const { year, month, day } = parts(anchor);
  const index = month - 1 + monthsToAdd;
  const nextYear = year + Math.floor(index / 12);
  const nextMonth = (index % 12) + 1;
  return format(nextYear, nextMonth, Math.min(day, daysInMonth(nextYear, nextMonth)));
}

/**
 * Dates a rule produces inside an inclusive range.
 * The anchor is the rule start, so February does not permanently shorten a 31st.
 */
export function occurrenceDates(rule: RecurringExpense, rangeStart: string, rangeEnd: string): string[] {
  const limit = rule.endDate && rule.endDate < rangeEnd ? rule.endDate : rangeEnd;

  if (rule.startDate > limit || rangeStart > limit) {
    return [];
  }

  if (rule.frequency === "weekly") {
    let cursor = rule.startDate;

    if (cursor < rangeStart) {
      const skip = Math.floor(daysBetween(cursor, rangeStart) / 7);
      cursor = addDays(cursor, skip * 7);
    }

    const dates: string[] = [];

    while (cursor < rangeStart) {
      cursor = addDays(cursor, 7);
    }

    while (cursor <= limit) {
      dates.push(cursor);
      cursor = addDays(cursor, 7);
    }

    return dates;
  }

  const step = rule.frequency === "yearly" ? 12 : 1;
  const dates: string[] = [];

  for (let index = 0; index < 2400; index += 1) {
    const date = shiftMonths(rule.startDate, index * step);

    if (date > limit) {
      break;
    }

    if (date >= rangeStart) {
      dates.push(date);
    }
  }

  return dates;
}
