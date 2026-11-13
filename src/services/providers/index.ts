/**
 * Persistence providers.
 * Development will use JSON Server. Production will use Supabase.
 * Components and features must not import a provider directly.
 */
export const dataProviderNames = ["json-server", "supabase"] as const;

export type DataProviderName = (typeof dataProviderNames)[number];
