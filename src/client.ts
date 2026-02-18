import type { LysticaConfig, ApiKeyInfo } from "./types";
import { HttpClient } from "./http";
import { Contacts } from "./resources/contacts";
import { Companies } from "./resources/companies";
import { Emails } from "./resources/emails";
import { Lists } from "./resources/lists";

const API_KEY_PREFIXES = ["lys_live_", "lys_test_"] as const;

export class LysticaCloud {
  /** Access the Contacts API. */
  public readonly contacts: Contacts;

  /** Access the Companies API. */
  public readonly companies: Companies;

  /** Access the Emails API. */
  public readonly emails: Emails;

  /** Access the Lists API. */
  public readonly lists: Lists;

  private readonly http: HttpClient;

  /**
   * Create a new Lystica Cloud client.
   *
   * @example
   * ```ts
   * import { LysticaCloud } from "lystica-cloud";
   *
   * const lystica = new LysticaCloud({
   *   apiKey: process.env.LYSTICA_API_KEY!,
   * });
   *
   * const { data } = await lystica.contacts.list({ limit: 50 });
   * ```
   */
  constructor(config: LysticaConfig) {
    if (!config.apiKey) {
      throw new Error(
        "LysticaCloud: apiKey is required. " +
          "Get one at https://lystica.cloud/dashboard/api-keys"
      );
    }

    const hasValidPrefix = API_KEY_PREFIXES.some((prefix) =>
      config.apiKey.startsWith(prefix)
    );

    if (!hasValidPrefix) {
      throw new Error(
        "LysticaCloud: apiKey must start with 'lys_live_' or 'lys_test_'. " +
          "Make sure you're using a valid Lystica API key."
      );
    }

    this.http = new HttpClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      timeout: config.timeout,
      maxRetries: config.maxRetries,
    });

    this.contacts = new Contacts(this.http);
    this.companies = new Companies(this.http);
    this.emails = new Emails(this.http);
    this.lists = new Lists(this.http);
  }

  /**
   * Verify the API key is valid and return key metadata.
   *
   * @example
   * ```ts
   * const info = await lystica.verifyKey();
   * console.log(`Key "${info.name}" has scopes: ${info.scopes.join(", ")}`);
   * ```
   */
  async verifyKey(): Promise<ApiKeyInfo> {
    return this.http.request<ApiKeyInfo>({
      method: "GET",
      path: "/api/v1/auth/verify",
    });
  }
}
