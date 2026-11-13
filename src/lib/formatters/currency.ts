import { APP_CURRENCY, APP_LOCALE } from "@/constants/app";
import type { Cents } from "@/types/money";

const currencyFormatter = new Intl.NumberFormat(APP_LOCALE, {
  style: "currency",
  currency: APP_CURRENCY,
});

const compactCurrencyFormatter = new Intl.NumberFormat(APP_LOCALE, {
  style: "currency",
  currency: APP_CURRENCY,
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Formats an integer amount of cents as Brazilian reais. */
export function formatCurrency(cents: Cents): string {
  if (!Number.isInteger(cents)) {
    throw new Error("Currency amount must be an integer number of cents.");
  }

  return currencyFormatter.format(cents / 100).replace(/[\u00a0\u202f]/g, " ");
}

/** Compact axis label. 420000 cents becomes a short reais string. */
export function formatCurrencyCompact(cents: Cents): string {
  if (!Number.isInteger(cents)) {
    throw new Error("Currency amount must be an integer number of cents.");
  }

  return compactCurrencyFormatter.format(cents / 100).replace(/[\u00a0\u202f]/g, " ");
}
