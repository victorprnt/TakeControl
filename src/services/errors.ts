export type DataErrorCode =
  | "unavailable"
  | "http"
  | "invalid"
  | "not_found"
  | "conflict"
  | "provider_unavailable"
  | "empty";

export class DataAccessError extends Error {
  readonly code: DataErrorCode;
  readonly status?: number;

  constructor(message: string, code: DataErrorCode, status?: number) {
    super(message);
    this.name = "DataAccessError";
    this.code = code;
    this.status = status;
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof DataAccessError) {
    return error.message;
  }

  return "Não foi possível carregar os dados.";
}
