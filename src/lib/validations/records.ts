import type { Cents } from "@/types/money";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error("Expected an object.");
  }

  return value;
}

export function readString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid ${field}.`);
  }

  return value;
}

export function readOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid ${field}.`);
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function readBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`Invalid ${field}.`);
  }

  return value;
}

/** Integer cents. `min` defaults to zero so stored money cannot be negative. */
export function readCents(value: unknown, field: string, min = 0): Cents {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min) {
    throw new Error(`Invalid ${field}.`);
  }

  return value;
}

export function readEnum<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new Error(`Invalid ${field}.`);
  }

  return value as T;
}

export function isDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match?.[1] || !match[2] || !match[3]) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function readDateOnly(value: unknown, field: string): string {
  if (typeof value !== "string" || !isDateOnly(value)) {
    throw new Error(`Invalid ${field}.`);
  }

  return value;
}

export function isTimestamp(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function readTimestamp(value: unknown, field: string): string {
  if (typeof value !== "string" || !isTimestamp(value)) {
    throw new Error(`Invalid ${field}.`);
  }

  return value;
}

export function isHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function readHexColor(value: unknown, field: string): string {
  if (typeof value !== "string" || !isHexColor(value)) {
    throw new Error(`Invalid ${field}.`);
  }

  return value;
}

export function readNullableId(value: unknown, field: string): string | null {
  if (value === null) {
    return null;
  }

  return readString(value, field);
}
