import "server-only";

import { DataAccessError } from "@/services/errors";

/**
 * HTTP access for the JSON Server provider.
 * Repository interfaces and the rest of the app do not call these endpoints.
 * db.json is local development data. Do not deploy it as storage on Vercel.
 */
export class JsonServerClient {
  constructor(private readonly baseUrl: string) {}

  get<T>(path: string, parse: (value: unknown) => T): Promise<T> {
    return this.request(path, { method: "GET" }, parse);
  }

  async getOrNull<T>(path: string, parse: (value: unknown) => T): Promise<T | null> {
    try {
      return await this.request(path, { method: "GET" }, parse);
    } catch (error) {
      if (error instanceof DataAccessError && error.status === 404) {
        return null;
      }

      throw error;
    }
  }

  post<T>(path: string, body: unknown, parse: (value: unknown) => T): Promise<T> {
    return this.request(path, { method: "POST", body: JSON.stringify(body) }, parse);
  }

  patch<T>(path: string, body: unknown, parse: (value: unknown) => T): Promise<T> {
    return this.request(path, { method: "PATCH", body: JSON.stringify(body) }, parse);
  }

  put<T>(path: string, body: unknown, parse: (value: unknown) => T): Promise<T> {
    return this.request(path, { method: "PUT", body: JSON.stringify(body) }, parse);
  }

  async delete(path: string): Promise<void> {
    const url = new URL(path, `${this.baseUrl}/`);
    let response: Response;

    try {
      response = await fetch(url, {
        method: "DELETE",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
    } catch (error) {
      console.error("JSON Server is unreachable", url.pathname, error);
      throw new DataAccessError("Não foi possível falar com o servidor de dados.", "unavailable");
    }

    if (response.status === 404) {
      throw new DataAccessError("Registro não encontrado.", "not_found", 404);
    }

    if (!response.ok) {
      console.error("JSON Server responded with an error", response.status, url.pathname);
      throw new DataAccessError("O servidor de dados respondeu com um erro.", "http", response.status);
    }
  }

  private async request<T>(path: string, init: RequestInit, parse: (value: unknown) => T): Promise<T> {
    const url = new URL(path, `${this.baseUrl}/`);
    let response: Response;

    try {
      response = await fetch(url, {
        ...init,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...init.headers,
        },
        cache: "no-store",
      });
    } catch (error) {
      console.error("JSON Server is unreachable", url.pathname, error);
      throw new DataAccessError("Não foi possível falar com o servidor de dados.", "unavailable");
    }

    if (response.status === 404) {
      throw new DataAccessError("Registro não encontrado.", "not_found", 404);
    }

    if (!response.ok) {
      console.error("JSON Server responded with an error", response.status, url.pathname);
      throw new DataAccessError("O servidor de dados respondeu com um erro.", "http", response.status);
    }

    let body: unknown;

    try {
      body = await response.json();
    } catch (error) {
      console.error("JSON Server returned a body that is not JSON", url.pathname, error);
      throw new DataAccessError("Os dados recebidos estão incompletos ou inválidos.", "invalid");
    }

    try {
      return parse(body);
    } catch (error) {
      console.error("JSON Server returned a record that failed validation", url.pathname, error);
      throw new DataAccessError("Os dados recebidos estão incompletos ou inválidos.", "invalid");
    }
  }
}

export function createJsonServerClient(): JsonServerClient {
  const env = process.env;
  const configured = env.JSON_SERVER_URL ?? "http://127.0.0.1:3001";
  return new JsonServerClient(configured.replace(/\/$/, ""));
}
