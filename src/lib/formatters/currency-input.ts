import type { Cents } from "@/types/money";

const GROUPED = /^\d{1,3}(\.\d{3})*(,\d{1,2})?$/;
const PLAIN = /^\d+(,\d{1,2})?$/;

/** Parses a pt-BR reais field into integer cents. Returns null when the text is not a valid amount. */
export function parseCurrencyToCents(input: string): Cents | null {
  const cleaned = input.trim().replace(/^R\$\s*/i, "").replace(/\s/g, "");

  if (!cleaned || !(GROUPED.test(cleaned) || PLAIN.test(cleaned))) {
    return null;
  }

  const [whole, fraction = ""] = cleaned.replace(/\./g, "").split(",");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

  if (!Number.isInteger(cents) || cents < 0) {
    return null;
  }

  return cents;
}

/** Editable pt-BR amount without the currency symbol. 125000 becomes "1.250,00". */
export function formatCurrencyInput(cents: Cents): string {
  if (!Number.isInteger(cents)) {
    throw new Error("Currency amount must be an integer number of cents.");
  }

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
