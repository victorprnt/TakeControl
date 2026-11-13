import "server-only";

import { DataAccessError } from "@/services/errors";
import type { Repositories } from "@/services/repositories";

function unavailableRepository<T extends object>(): T {
  return new Proxy({} as T, {
    get(_target, property) {
      if (property === "then") {
        return undefined;
      }

      return () => Promise.reject(new DataAccessError("O provedor Supabase ainda não está disponível.", "provider_unavailable"));
    },
  });
}

/** Same repository contracts as JSON Server. The Supabase driver is intentionally absent. */
export function createSupabaseRepositories(): Repositories {
  return {
    categories: unavailableRepository(),
    monthlyBudgets: unavailableRepository(),
    categoryBudgets: unavailableRepository(),
    transactions: unavailableRepository(),
    recurringExpenses: unavailableRepository(),
    fixedBills: unavailableRepository(),
  };
}
