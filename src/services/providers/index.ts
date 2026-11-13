import "server-only";

import { dataProviderNames, type DataProviderName } from "@/services/providers/names";
import { createJsonServerClient } from "@/services/providers/json-server/client";
import { createJsonServerRepositories } from "@/services/providers/json-server/repositories";
import { createSupabaseRepositories } from "@/services/providers/supabase/repositories";
import { DataAccessError } from "@/services/errors";
import type { Repositories } from "@/services/repositories";

export { dataProviderNames, type DataProviderName } from "@/services/providers/names";

function readDataProvider(): DataProviderName {
  const env = process.env;
  const value = env.DATA_PROVIDER ?? "json-server";

  if (!dataProviderNames.includes(value as DataProviderName)) {
    throw new DataAccessError("O provedor de dados configurado não é reconhecido.", "provider_unavailable");
  }

  return value as DataProviderName;
}

/**
 * Selects the persistence implementation.
 * JSON Server is for local development only. It is not a database for Vercel.
 */
export function createRepositories(): Repositories {
  const provider = readDataProvider();

  if (provider === "supabase") {
    return createSupabaseRepositories();
  }

  return createJsonServerRepositories(createJsonServerClient());
}
