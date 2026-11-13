"use server";

import { toUserMessage } from "@/services/errors";
import { getServices } from "@/services";
import type { FinanceSnapshot } from "@/types/finance-snapshot";

export type FinanceLoadResult =
  | { ok: true; snapshot: FinanceSnapshot }
  | { ok: false; message: string };

export async function loadFinanceSnapshot(monthId?: string): Promise<FinanceLoadResult> {
  try {
    const snapshot = await getServices().budgets.getSnapshot(monthId);
    return { ok: true, snapshot };
  } catch (error) {
    console.error(error);
    return { ok: false, message: toUserMessage(error) };
  }
}
