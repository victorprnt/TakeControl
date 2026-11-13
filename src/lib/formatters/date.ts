import { APP_LOCALE, APP_TIMEZONE } from "@/constants/app";
import { parseMonthId } from "@/lib/validations/month-id";
import type { MonthId } from "@/types/month";

const dateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIMEZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

const monthShortFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: "UTC",
  month: "short",
  year: "numeric",
});

/** Example: 13 de nov. de 2026 */
export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

/** Example: 13/11/2026 */
export function formatShortDate(date: Date): string {
  return shortDateFormatter.format(date);
}

/** Example: novembro de 2026 */
export function formatMonth(monthId: MonthId): string {
  const { year, month } = parseMonthId(monthId);
  return monthFormatter.format(new Date(Date.UTC(year, month - 1, 1, 12)));
}

/** Example: nov. de 2026 */
export function formatMonthShort(monthId: MonthId): string {
  const { year, month } = parseMonthId(monthId);
  return monthShortFormatter.format(new Date(Date.UTC(year, month - 1, 1, 12)));
}

/** Converts an instant to YYYY-MM in America/Fortaleza. */
export function toMonthId(date: Date): MonthId {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  if (!year || !month) {
    throw new Error("Unable to resolve a month identifier for the given date.");
  }

  return `${year}-${month}`;
}

/**
 * Current month in America/Fortaleza.
 * Rendering this during prerender requires the Cache Components current-time pattern.
 */
export function getCurrentMonth(reference: Date = new Date()): MonthId {
  return toMonthId(reference);
}

/** Previous calendar month. Defaults to the month before the current one. */
export function getPreviousMonth(monthId: MonthId = getCurrentMonth()): MonthId {
  const { year, month } = parseMonthId(monthId);

  if (month === 1) {
    return `${year - 1}-12`;
  }

  return `${year}-${String(month - 1).padStart(2, "0")}`;
}
