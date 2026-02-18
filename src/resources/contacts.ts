import type {
  Contact,
  CreateContactData,
  UpdateContactData,
  ListContactsParams,
  PaginatedResponse,
} from "../types";
import type { HttpClient } from "../http";

const BASE_PATH = "/api/v1/contacts";

export class Contacts {
  constructor(private readonly http: HttpClient) {}

  /**
   * List contacts with optional filters and pagination.
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
  async list(params?: ListContactsParams): Promise<PaginatedResponse<Contact>> {
    return this.http.request<PaginatedResponse<Contact>>({
      method: "GET",
      path: BASE_PATH,
      params: params as Record<string, string | number | undefined>,
    });
  }

  /**
   * Get a single contact by ID.
   *
   * @example
   * ```ts
   * const contact = await lystica.contacts.get("cnt_abc123");
   * ```
   */
  async get(id: string): Promise<Contact> {
    return this.http.request<Contact>({
      method: "GET",
      path: `${BASE_PATH}/${id}`,
    });
  }

  /**
   * Create a new contact.
   *
   * @example
   * ```ts
   * const contact = await lystica.contacts.create({
   *   email: "jane@example.com",
   *   firstName: "Jane",
   *   lastName: "Doe",
   *   company: "Acme Inc",
   * });
   * ```
   */
  async create(data: CreateContactData): Promise<Contact> {
    return this.http.request<Contact>({
      method: "POST",
      path: BASE_PATH,
      body: data,
    });
  }

  /**
   * Update an existing contact.
   *
   * @example
   * ```ts
   * const updated = await lystica.contacts.update("cnt_abc123", {
   *   jobTitle: "Senior Engineer",
   * });
   * ```
   */
  async update(id: string, data: UpdateContactData): Promise<Contact> {
    return this.http.request<Contact>({
      method: "PATCH",
      path: `${BASE_PATH}/${id}`,
      body: data,
    });
  }

  /**
   * Delete a contact.
   *
   * @example
   * ```ts
   * await lystica.contacts.delete("cnt_abc123");
   * ```
   */
  async delete(id: string): Promise<void> {
    await this.http.request<void>({
      method: "DELETE",
      path: `${BASE_PATH}/${id}`,
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
  ): Promise<PaginatedResponse<Contact>> {
    return this.list({ ...params, search: query });
  }

  /**
   * Add tags to a contact.
   *
   * @example
   * ```ts
   * const contact = await lystica.contacts.addTags("cnt_abc123", ["vip", "enterprise"]);
   * ```
   */
  async addTags(id: string, tags: string[]): Promise<Contact> {
    return this.http.request<Contact>({
      method: "POST",
      path: `${BASE_PATH}/${id}/tags`,
      body: { tags },
    });
  }

  /**
   * Remove tags from a contact.
   *
   * @example
   * ```ts
   * const contact = await lystica.contacts.removeTags("cnt_abc123", ["old-tag"]);
   * ```
   */
  async removeTags(id: string, tags: string[]): Promise<Contact> {
    return this.http.request<Contact>({
      method: "DELETE",
      path: `${BASE_PATH}/${id}/tags`,
      body: { tags },
    });
  }

  /**
   * Iterate through all contacts matching the given filters.
   * Automatically handles cursor-based pagination.
   *
   * @example
   * ```ts
   * for await (const contact of lystica.contacts.listAll({ industry: "Finance" })) {
   *   console.log(contact.fullName);
   * }
   * ```
   */
  async *listAll(
    params?: Omit<ListContactsParams, "cursor">
  ): AsyncGenerator<Contact> {
    let cursor: string | undefined;
    do {
      const response = await this.list({ ...params, limit: 200, cursor });
      for (const item of response.data) {
        yield item;
      }
      cursor = response.meta.cursor ?? undefined;
    } while (cursor);
  }
}
