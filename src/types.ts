// ---------------------------------------------------------------------------
// Client configuration
// ---------------------------------------------------------------------------

export interface LysticaConfig {
  /** Your Lystica API key (starts with lys_live_ or lys_test_) */
  apiKey: string;

  /**
   * Base URL of the Lystica API.
   * @default "https://api.lystica.cloud"
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;

  /**
   * Maximum number of automatic retries on 5xx / network errors.
   * @default 2
   */
  maxRetries?: number;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationParams {
  /** Number of items per page (1-200). @default 50 */
  limit?: number;

  /** Cursor for the next page of results. */
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    cursor: string | null;
    hasMore: boolean;
  };
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
  city?: string;
  seniority?: string;
  companySize?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  industry?: string;
  country?: string;
  city?: string;
  seniority?: string;
  companySize?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  tags?: string[];
}

export type UpdateContactData = Partial<CreateContactData>;

export interface ListContactsParams extends PaginationParams {
  industry?: string;
  country?: string;
  company?: string;
  seniority?: string;
  tag?: string;
  search?: string;
}

// ---------------------------------------------------------------------------
// Company
// ---------------------------------------------------------------------------

export interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  country?: string;
  city?: string;
  description?: string;
  logoUrl?: string;
  linkedinUrl?: string;
  website?: string;
  foundedYear?: number;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListCompaniesParams extends PaginationParams {
  industry?: string;
  country?: string;
  size?: string;
  search?: string;
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

export interface Email {
  id: string;
  to: string[];
  from: string;
  subject: string;
  htmlBody?: string;
  textBody?: string;
  status: "queued" | "sent" | "delivered" | "bounced" | "failed";
  listId?: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface SendEmailData {
  to: string | string[];
  from: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  scheduledAt?: string;
  tags?: string[];
}

export interface ListEmailsParams extends PaginationParams {
  status?: Email["status"];
  listId?: string;
}

// ---------------------------------------------------------------------------
// List (mailing / contact list)
// ---------------------------------------------------------------------------

export interface ContactList {
  id: string;
  name: string;
  description?: string;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListData {
  name: string;
  description?: string;
}

export type UpdateListData = Partial<CreateListData>;

export interface ListListsParams extends PaginationParams {
  search?: string;
}

// ---------------------------------------------------------------------------
// API Key info
// ---------------------------------------------------------------------------

export interface ApiKeyInfo {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}

// ---------------------------------------------------------------------------
// Webhook
// ---------------------------------------------------------------------------

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export interface LysticaErrorBody {
  error: string;
  message?: string;
  code?: string;
}

// ---------------------------------------------------------------------------
// Internal HTTP types
// ---------------------------------------------------------------------------

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}
