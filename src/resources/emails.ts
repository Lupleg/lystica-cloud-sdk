import type {
  Email,
  SendEmailData,
  ListEmailsParams,
  PaginatedResponse,
} from "../types";
import type { HttpClient } from "../http";

const BASE_PATH = "/api/v1/emails";

export class Emails {
  constructor(private readonly http: HttpClient) {}

  /**
   * Send an email (or schedule it for later).
   *
   * @example
   * ```ts
   * const email = await lystica.emails.send({
   *   from: "you@yourdomain.com",
   *   to: "jane@example.com",
   *   subject: "Hello from Lystica",
   *   html: "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
   * });
   * ```
   */
  async send(data: SendEmailData): Promise<Email> {
    const payload = {
      ...data,
      to: Array.isArray(data.to) ? data.to : [data.to],
    };
    return this.http.request<Email>({
      method: "POST",
      path: BASE_PATH,
      body: payload,
    });
  }

  /**
   * Get the status and details of a sent email.
   *
   * @example
   * ```ts
   * const email = await lystica.emails.get("eml_abc123");
   * console.log(email.status); // "delivered"
   * ```
   */
  async get(id: string): Promise<Email> {
    return this.http.request<Email>({
      method: "GET",
      path: `${BASE_PATH}/${id}`,
    });
  }

  /**
   * List sent emails with optional filters.
   *
   * @example
   * ```ts
   * const { data } = await lystica.emails.list({ status: "bounced" });
   * ```
   */
  async list(params?: ListEmailsParams): Promise<PaginatedResponse<Email>> {
    return this.http.request<PaginatedResponse<Email>>({
      method: "GET",
      path: BASE_PATH,
      params: params as Record<string, string | number | undefined>,
    });
  }

  /**
   * Cancel a scheduled email that hasn't been sent yet.
   *
   * @example
   * ```ts
   * await lystica.emails.cancel("eml_abc123");
   * ```
   */
  async cancel(id: string): Promise<void> {
    await this.http.request<void>({
      method: "POST",
      path: `${BASE_PATH}/${id}/cancel`,
    });
  }
}
