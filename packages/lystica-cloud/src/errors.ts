import type { LysticaErrorBody } from "./types";

export class LysticaError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(status: number, body: LysticaErrorBody) {
    super(body.message || body.error);
    this.name = "LysticaError";
    this.status = status;
    this.code = body.error;
  }
}

export class LysticaAuthError extends LysticaError {
  constructor(body: LysticaErrorBody) {
    super(401, body);
    this.name = "LysticaAuthError";
  }
}

export class LysticaForbiddenError extends LysticaError {
  constructor(body: LysticaErrorBody) {
    super(403, body);
    this.name = "LysticaForbiddenError";
  }
}

export class LysticaRateLimitError extends LysticaError {
  constructor(body: LysticaErrorBody) {
    super(429, body);
    this.name = "LysticaRateLimitError";
  }
}

export class LysticaNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LysticaNetworkError";
  }
}
