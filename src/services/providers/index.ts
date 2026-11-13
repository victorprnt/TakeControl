import "server-only";

import { dataProviderNames, type DataProviderName } from "@/services/providers/names";
import { createJsonServerClient } from "@/services/providers/json-server/client";
import { createJsonServerRepositories } from "@/services/providers/json-server/repositories";
import { createRedisRepositories } from "@/services/providers/redis/repositories";
import { readDocument, readRedisCredentials, writeDocument } from "@/services/providers/redis/store";
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
 * Upstash Redis credentials store the whole db.json document. That is the Vercel path.
 * Without those credentials, JSON Server remains the local database.
 */
export function createRepositories(): Repositories {
  if (readRedisCredentials()) {
    return createRedisRepositories({ read: readDocument, write: writeDocument });
  }

  const provider = readDataProvider();

  if (provider === "supabase") {
    return createSupabaseRepositories();
  }

  return createJsonServerRepositories(createJsonServerClient());
}
