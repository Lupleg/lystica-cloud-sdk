import type {
  ListContactsParams,
  ListContactsResponse,
  Contact,
} from "../types";
import { HttpClient } from "../http";

export class Contacts {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * List contacts with optional filters.
   *
   * @example
   * ```ts
   * const { data, meta } = await lystica.contacts.list({
   *   limit: 100,
   *   industry: "Technology",
   *   country: "United States",
   * });
   * ```
   */
  async list(params?: ListContactsParams): Promise<ListContactsResponse> {
    return this.http.request<ListContactsResponse>({
      method: "GET",
      path: "/api/v1/contacts",
      params: params as Record<string, string | number | undefined>,
    });
  }

  /**
   * Search contacts by a query string.
   * Shorthand for `list({ search })`.
   *
   * @example
   * ```ts
   * const { data } = await lystica.contacts.search("jane@example.com");
   * ```
   */
  async search(
    query: string,
    params?: Omit<ListContactsParams, "search">
  ): Promise<ListContactsResponse> {
    return this.list({ ...params, search: query });
  }

  /**
   * Fetch all contacts matching the filters, automatically paginating
   * through the API. Returns an array of all contacts.
   *
   * ⚠️ Use with care on large datasets.
   *
   * @example
   * ```ts
   * const allContacts = await lystica.contacts.listAll({
   *   industry: "Finance",
   * });
   * ```
   */
  async listAll(
    params?: Omit<ListContactsParams, "limit">
  ): Promise<Contact[]> {
    const batchSize = 200;
    const result = await this.list({ ...params, limit: batchSize });
    return result.data;
  }
}
