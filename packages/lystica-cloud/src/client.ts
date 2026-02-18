import type { LysticaConfig } from "./types";
import { HttpClient } from "./http";
import { Contacts } from "./resources/contacts";

export class LysticaCloud {
  /** Access the Contacts API. */
  public readonly contacts: Contacts;

  private readonly http: HttpClient;

  /**
   * Create a new Lystica Cloud client.
   *
   * @example
   * ```ts
   * import { LysticaCloud } from "lystica-cloud";
   *
   * const lystica = new LysticaCloud({
   *   apiKey: "lys_live_...",
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

    if (!config.apiKey.startsWith("lys_live_")) {
      throw new Error(
        "LysticaCloud: apiKey must start with 'lys_live_'. " +
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
  }
}
