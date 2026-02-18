import type { RequestOptions, LysticaErrorBody } from "./types";
import {
  LysticaError,
  LysticaAuthError,
  LysticaForbiddenError,
  LysticaNotFoundError,
  LysticaValidationError,
  LysticaRateLimitError,
  LysticaNetworkError,
} from "./errors";
import { VERSION } from "./version";

const DEFAULT_BASE_URL = "https://api.lystica.cloud";
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_RETRIES = 2;
const RETRYABLE_STATUS = new Set([408, 502, 503, 504]);

export class HttpClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(opts: {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
    maxRetries?: number;
  }) {
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.timeout = opts.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = opts.maxRetries ?? DEFAULT_MAX_RETRIES;
  }

  async request<T>(opts: RequestOptions): Promise<T> {
    const url = this.buildUrl(opts.path, opts.params);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": `lystica-cloud-sdk/${VERSION}`,
      "X-SDK-Version": VERSION,
    };

    const init: RequestInit = {
      method: opts.method,
      headers,
      ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);
        init.signal = controller.signal;

        const response = await fetch(url, init);
        clearTimeout(timer);

        if (response.ok) {
          if (response.status === 204) {
            return undefined as T;
          }
          return (await response.json()) as T;
        }

        const body = await this.safeParseJson(response);

        if (RETRYABLE_STATUS.has(response.status) && attempt < this.maxRetries) {
          lastError = new LysticaError(response.status, body);
          await this.sleep(this.backoff(attempt));
          continue;
        }

        throw this.toTypedError(response.status, body);
      } catch (err) {
        if (this.isLysticaError(err)) {
          throw err;
        }

        if (err instanceof DOMException && err.name === "AbortError") {
          lastError = new LysticaNetworkError("Request timed out");
        } else if (err instanceof TypeError) {
          lastError = new LysticaNetworkError(`Network error: ${err.message}`);
        } else {
          lastError = err as Error;
        }

        if (attempt < this.maxRetries) {
          await this.sleep(this.backoff(attempt));
          continue;
        }
      }
    }

    throw lastError ?? new LysticaNetworkError("Request failed after retries");
  }

  private isLysticaError(err: unknown): boolean {
    return (
      err instanceof LysticaError ||
      err instanceof LysticaNetworkError
    );
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && String(value) !== "") {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async safeParseJson(response: Response): Promise<LysticaErrorBody> {
    try {
      return await response.json();
    } catch {
      return { error: `HTTP ${response.status}` };
    }
  }

  private toTypedError(status: number, body: LysticaErrorBody): LysticaError {
    switch (status) {
      case 401:
        return new LysticaAuthError(body);
      case 403:
        return new LysticaForbiddenError(body);
      case 404:
        return new LysticaNotFoundError(body);
      case 422:
        return new LysticaValidationError(body);
      case 429:
        return new LysticaRateLimitError(body);
      default:
        return new LysticaError(status, body);
    }
  }

  private backoff(attempt: number): number {
    const base = Math.min(1000 * 2 ** attempt, 10_000);
    const jitter = Math.random() * 500;
    return base + jitter;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
