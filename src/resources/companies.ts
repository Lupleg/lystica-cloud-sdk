import type {
  Company,
  ListCompaniesParams,
  PaginatedResponse,
  Contact,
  PaginationParams,
} from "../types";
import type { HttpClient } from "../http";

const BASE_PATH = "/api/v1/companies";

export class Companies {
  constructor(private readonly http: HttpClient) {}

  /**
   * List companies with optional filters and pagination.
   *
   * @example
   * ```ts
   * const { data, meta } = await lystica.companies.list({
   *   industry: "Technology",
   *   size: "51-200",
   * });
   * ```
   */
  async list(params?: ListCompaniesParams): Promise<PaginatedResponse<Company>> {
    return this.http.request<PaginatedResponse<Company>>({
      method: "GET",
      path: BASE_PATH,
      params: params as Record<string, string | number | undefined>,
    });
  }

  /**
   * Get a single company by ID.
   *
   * @example
   * ```ts
   * const company = await lystica.companies.get("cmp_abc123");
   * ```
   */
  async get(id: string): Promise<Company> {
    return this.http.request<Company>({
      method: "GET",
      path: `${BASE_PATH}/${id}`,
    });
  }

  /**
   * Search companies by name or domain.
   *
   * @example
   * ```ts
   * const { data } = await lystica.companies.search("acme");
   * ```
   */
  async search(
    query: string,
    params?: Omit<ListCompaniesParams, "search">
  ): Promise<PaginatedResponse<Company>> {
    return this.list({ ...params, search: query });
  }

  /**
   * List contacts belonging to a specific company.
   *
   * @example
   * ```ts
   * const { data } = await lystica.companies.listContacts("cmp_abc123");
   * ```
   */
  async listContacts(
    companyId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Contact>> {
    return this.http.request<PaginatedResponse<Contact>>({
      method: "GET",
      path: `${BASE_PATH}/${companyId}/contacts`,
      params: params as Record<string, string | number | undefined>,
    });
  }

  /**
   * Iterate through all companies matching the given filters.
   * Automatically handles cursor-based pagination.
   *
   * @example
   * ```ts
   * for await (const company of lystica.companies.listAll({ industry: "SaaS" })) {
   *   console.log(company.name);
   * }
   * ```
   */
  async *listAll(
    params?: Omit<ListCompaniesParams, "cursor">
  ): AsyncGenerator<Company> {
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
