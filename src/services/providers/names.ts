export const dataProviderNames = ["json-server", "supabase"] as const;

export type DataProviderName = (typeof dataProviderNames)[number];
