// ---------------------------------------------------------------------------
// Client configuration
// ---------------------------------------------------------------------------

export interface LysticaConfig {
  /** Your Lystica API key (starts with lys_live_) */
  apiKey: string;

  /**
   * Base URL of the Lystica API.
   * Defaults to https://lystica.cloud
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * Defaults to 30 000 (30 s).
   */
  timeout?: number;

  /**
   * Maximum number of automatic retries on 5xx / network errors.
   * Defaults to 2.
   */
  maxRetries?: number;
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export interface Contact {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  company?: string;
  jobTitle?: string;
  industry?: string;
  country?: string;
  seniority?: string;
  companySize?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  tags: string[];
}

// ---------------------------------------------------------------------------
// List contacts parameters & response
// ---------------------------------------------------------------------------

export interface ListContactsParams {
  /** Maximum number of contacts to return (1-200, default 50). */
  limit?: number;

  /** Filter by industry. */
  industry?: string;

  /** Filter by country. */
  country?: string;

  /** Filter by company name. */
  company?: string;

  /** Full-text search across name, email, company, and job title. */
  search?: string;
}

export interface ListContactsMeta {
  total: number;
  limit: number;
  filters: Record<string, string>;
}

export interface ListContactsResponse {
  data: Contact[];
  meta: ListContactsMeta;
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export interface LysticaErrorBody {
  error: string;
  message?: string;
}

// ---------------------------------------------------------------------------
// Internal HTTP types
// ---------------------------------------------------------------------------

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  params?: Record<string, string | number | undefined>;
  body?: unknown;
}
