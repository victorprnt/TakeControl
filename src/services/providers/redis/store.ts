import "server-only";

import { Redis } from "@upstash/redis";

import seedFile from "../../../../db.json";
import { DataAccessError } from "@/services/errors";
import { parseFinanceDocument, type FinanceDocument } from "@/services/providers/redis/document";

const STATE_KEY = "take-control:state";

type RedisCredentials = {
  url: string;
  token: string;
};

/**
 * Vercel Upstash integration sets UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
 * KV_REST_API_URL and KV_REST_API_TOKEN are the older names for the same REST database.
 */
export function readRedisCredentials(): RedisCredentials | null {
  const env = process.env;
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

function client(): Redis {
  const credentials = readRedisCredentials();

  if (!credentials) {
    throw new DataAccessError("O Redis ainda não está configurado.", "provider_unavailable");
  }

  return new Redis({
    url: credentials.url,
    token: credentials.token,
    cache: "no-store",
  });
}

function rethrow(error: unknown): never {
  if (error instanceof DataAccessError) {
    throw error;
  }

  console.error("Upstash Redis is unreachable", error);
  throw new DataAccessError("Não foi possível falar com o servidor de dados.", "unavailable");
}

function parseStored(value: unknown): FinanceDocument {
  try {
    return parseFinanceDocument(value);
  } catch (error) {
    console.error("Finance document is invalid", error);
    throw new DataAccessError("Os dados recebidos estão incompletos ou inválidos.", "invalid");
  }
}

/** First empty key receives the bundled db.json. Later reads and writes use only Redis. */
export async function readDocument(): Promise<FinanceDocument> {
  let stored: unknown;

  try {
    stored = await client().get<unknown>(STATE_KEY);
  } catch (error) {
    rethrow(error);
  }

  if (stored == null) {
    const seeded = parseStored(seedFile);

    try {
      await client().set(STATE_KEY, seeded);
    } catch (error) {
      rethrow(error);
    }

    return seeded;
  }

  return parseStored(stored);
}

export async function writeDocument(document: FinanceDocument): Promise<void> {
  try {
    await client().set(STATE_KEY, document);
  } catch (error) {
    rethrow(error);
  }
}
