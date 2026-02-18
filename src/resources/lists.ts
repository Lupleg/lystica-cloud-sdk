import type {
  ContactList,
  CreateListData,
  UpdateListData,
  ListListsParams,
  PaginatedResponse,
  Contact,
  PaginationParams,
} from "../types";
import type { HttpClient } from "../http";

const BASE_PATH = "/api/v1/lists";

export class Lists {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all mailing / contact lists.
   *
   * @example
   * ```ts
   * const { data } = await lystica.lists.list();
   * ```
   */
  async list(params?: ListListsParams): Promise<PaginatedResponse<ContactList>> {
    return this.http.request<PaginatedResponse<ContactList>>({
      method: "GET",
      path: BASE_PATH,
      params: params as Record<string, string | number | undefined>,
    });
  }

  /**
   * Get a single list by ID.
   *
   * @example
   * ```ts
   * const list = await lystica.lists.get("lst_abc123");
   * ```
   */
  async get(id: string): Promise<ContactList> {
    return this.http.request<ContactList>({
      method: "GET",
      path: `${BASE_PATH}/${id}`,
    });
  }

  /**
   * Create a new contact list.
   *
   * @example
   * ```ts
   * const list = await lystica.lists.create({
   *   name: "Enterprise Leads Q1",
   *   description: "Filtered leads for Q1 outreach",
   * });
   * ```
   */
  async create(data: CreateListData): Promise<ContactList> {
    return this.http.request<ContactList>({
      method: "POST",
      path: BASE_PATH,
      body: data,
    });
  }

  /**
   * Update a list's name or description.
   *
   * @example
   * ```ts
   * const updated = await lystica.lists.update("lst_abc123", {
   *   name: "Enterprise Leads Q2",
   * });
   * ```
   */
  async update(id: string, data: UpdateListData): Promise<ContactList> {
    return this.http.request<ContactList>({
      method: "PATCH",
      path: `${BASE_PATH}/${id}`,
      body: data,
    });
  }

  /**
   * Delete a list.
   *
   * @example
   * ```ts
   * await lystica.lists.delete("lst_abc123");
   * ```
   */
  async delete(id: string): Promise<void> {
    await this.http.request<void>({
      method: "DELETE",
      path: `${BASE_PATH}/${id}`,
    });
  }

  /**
   * List contacts belonging to a specific list.
   *
   * @example
   * ```ts
   * const { data } = await lystica.lists.listContacts("lst_abc123");
   * ```
   */
  async listContacts(
    listId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Contact>> {
    return this.http.request<PaginatedResponse<Contact>>({
      method: "GET",
      path: `${BASE_PATH}/${listId}/contacts`,
      params: params as Record<string, string | number | undefined>,
    });
  }

  /**
   * Add contacts to a list by their IDs.
   *
   * @example
   * ```ts
   * await lystica.lists.addContacts("lst_abc123", ["cnt_1", "cnt_2"]);
   * ```
   */
  async addContacts(listId: string, contactIds: string[]): Promise<void> {
    await this.http.request<void>({
      method: "POST",
      path: `${BASE_PATH}/${listId}/contacts`,
      body: { contactIds },
    });
  }

  /**
   * Remove contacts from a list by their IDs.
   *
   * @example
   * ```ts
   * await lystica.lists.removeContacts("lst_abc123", ["cnt_1"]);
   * ```
   */
  async removeContacts(listId: string, contactIds: string[]): Promise<void> {
    await this.http.request<void>({
      method: "DELETE",
      path: `${BASE_PATH}/${listId}/contacts`,
      body: { contactIds },
    });
  }
}
