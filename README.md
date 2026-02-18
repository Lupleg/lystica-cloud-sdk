# Lystica-Cloud

Official Node.js & TypeScript SDK for the [Lystica Cloud](https://lystica.cloud) API.

Access professional contacts, companies, email campaigns, and lists programmatically. Integrate Lystica data into your own applications, CRMs, and workflows.

[![npm](https://img.shields.io/npm/v/lystica-cloud)](https://www.npmjs.com/package/lystica-cloud)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install lystica-cloud
```

```bash
yarn add lystica-cloud
```

```bash
pnpm add lystica-cloud
```

## Quick Start

```typescript
import { LysticaCloud } from "lystica-cloud";

const lystica = new LysticaCloud({
  apiKey: process.env.LYSTICA_API_KEY!,
});

// Fetch contacts
const { data, meta } = await lystica.contacts.list({
  limit: 50,
  industry: "Technology",
});

console.log(`Found ${meta.total} contacts`);
data.forEach((contact) => {
  console.log(`${contact.fullName} — ${contact.email}`);
});
```

## Getting an API Key

1. Sign in to [lystica.cloud](https://lystica.cloud)
2. Go to **Dashboard → API Keys**
3. Click **Create API Key**
4. Copy the key immediately (it's only shown once)
5. Store it securely (environment variable, secrets manager, etc.)

API keys use the format `lys_live_...` (production) or `lys_test_...` (sandbox).

## Configuration

```typescript
const lystica = new LysticaCloud({
  apiKey: "lys_live_...",       // Required
  baseUrl: "https://...",       // Default: https://api.lystica.cloud
  timeout: 30000,               // Default: 30s
  maxRetries: 2,                // Default: 2 (retries on 5xx / network errors)
});
```

| Option       | Type     | Default                      | Description                            |
| ------------ | -------- | ---------------------------- | -------------------------------------- |
| `apiKey`     | `string` | —                            | **Required.** Your Lystica API key.    |
| `baseUrl`    | `string` | `https://api.lystica.cloud`  | API base URL.                          |
| `timeout`    | `number` | `30000`                      | Request timeout in ms.                 |
| `maxRetries` | `number` | `2`                          | Auto-retries on 5xx / network errors.  |

---

## Resources

### Contacts

```typescript
// List with filters
const { data, meta } = await lystica.contacts.list({
  limit: 100,
  industry: "Finance",
  country: "United States",
  seniority: "Director",
});

// Get by ID
const contact = await lystica.contacts.get("cnt_abc123");

// Create
const newContact = await lystica.contacts.create({
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  company: "Acme Inc",
  tags: ["lead", "enterprise"],
});

// Update
const updated = await lystica.contacts.update("cnt_abc123", {
  jobTitle: "VP of Engineering",
});

// Delete
await lystica.contacts.delete("cnt_abc123");

// Search
const { data: results } = await lystica.contacts.search("jane@example.com");

// Tag management
await lystica.contacts.addTags("cnt_abc123", ["vip"]);
await lystica.contacts.removeTags("cnt_abc123", ["old-tag"]);

// Iterate all (auto-pagination)
for await (const contact of lystica.contacts.listAll({ industry: "SaaS" })) {
  console.log(contact.fullName);
}
```

### Companies

```typescript
// List
const { data } = await lystica.companies.list({
  industry: "Technology",
  size: "51-200",
});

// Get by ID
const company = await lystica.companies.get("cmp_abc123");

// Search
const { data: results } = await lystica.companies.search("acme");

// List contacts in a company
const { data: contacts } = await lystica.companies.listContacts("cmp_abc123");

// Iterate all
for await (const company of lystica.companies.listAll()) {
  console.log(company.name);
}
```

### Emails

```typescript
// Send an email
const email = await lystica.emails.send({
  from: "you@yourdomain.com",
  to: "recipient@example.com",
  subject: "Hello from Lystica",
  html: "<h1>Welcome!</h1>",
  text: "Welcome!",
});

// Schedule for later
const scheduled = await lystica.emails.send({
  from: "you@yourdomain.com",
  to: ["user1@example.com", "user2@example.com"],
  subject: "Weekly Update",
  html: "<p>Here's your weekly update...</p>",
  scheduledAt: "2026-03-01T09:00:00Z",
});

// Check status
const status = await lystica.emails.get("eml_abc123");
console.log(status.status); // "queued" | "sent" | "delivered" | "bounced" | "failed"

// Cancel a scheduled email
await lystica.emails.cancel("eml_abc123");

// List emails
const { data: emails } = await lystica.emails.list({ status: "bounced" });
```

### Lists

```typescript
// Create a list
const list = await lystica.lists.create({
  name: "Enterprise Leads Q1",
  description: "Filtered leads for Q1 outreach",
});

// Update
await lystica.lists.update("lst_abc123", { name: "Enterprise Leads Q2" });

// Add/remove contacts
await lystica.lists.addContacts("lst_abc123", ["cnt_1", "cnt_2", "cnt_3"]);
await lystica.lists.removeContacts("lst_abc123", ["cnt_1"]);

// List contacts in a list
const { data: contacts } = await lystica.lists.listContacts("lst_abc123");

// Delete
await lystica.lists.delete("lst_abc123");
```

### Verify API Key

```typescript
const info = await lystica.verifyKey();
console.log(info.name);     // "Production Key"
console.log(info.scopes);   // ["contacts:read", "contacts:write", ...]
```

---

## Pagination

All list endpoints return cursor-based paginated responses:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    cursor: string | null;
    hasMore: boolean;
  };
}
```

**Manual pagination:**

```typescript
let cursor: string | undefined;

do {
  const response = await lystica.contacts.list({ limit: 100, cursor });
  process.stdout.write(`Fetched ${response.data.length} contacts\n`);
  cursor = response.meta.cursor ?? undefined;
} while (cursor);
```

**Automatic pagination (async generator):**

```typescript
for await (const contact of lystica.contacts.listAll({ country: "US" })) {
  console.log(contact.email);
}
```

---

## Webhooks

Verify incoming webhook payloads from Lystica:

```typescript
import { Webhooks } from "lystica-cloud";

const webhooks = new Webhooks("whsec_your_signing_secret");

// In your webhook handler (e.g. Express):
app.post("/webhooks/lystica", async (req, res) => {
  try {
    const event = await webhooks.verify(
      req.body,                             // raw body string
      req.headers["x-lystica-signature"],   // signature header
      req.headers["x-lystica-timestamp"],   // timestamp header
    );

    switch (event.type) {
      case "contact.created":
        console.log("New contact:", event.data);
        break;
      case "email.delivered":
        console.log("Email delivered:", event.data);
        break;
    }

    res.status(200).send("ok");
  } catch (err) {
    res.status(400).send("Invalid signature");
  }
});
```

---

## Error Handling

The SDK throws typed errors you can catch individually:

```typescript
import {
  LysticaCloud,
  LysticaAuthError,
  LysticaForbiddenError,
  LysticaNotFoundError,
  LysticaValidationError,
  LysticaRateLimitError,
  LysticaError,
  LysticaNetworkError,
} from "lystica-cloud";

try {
  const { data } = await lystica.contacts.list();
} catch (err) {
  if (err instanceof LysticaAuthError) {
    console.error("Invalid or expired API key");
  } else if (err instanceof LysticaForbiddenError) {
    console.error("Insufficient permissions");
  } else if (err instanceof LysticaNotFoundError) {
    console.error("Resource not found");
  } else if (err instanceof LysticaValidationError) {
    console.error("Invalid request data:", err.message);
  } else if (err instanceof LysticaRateLimitError) {
    console.error("Rate limit exceeded — slow down");
  } else if (err instanceof LysticaNetworkError) {
    console.error("Network failure:", err.message);
  } else if (err instanceof LysticaError) {
    console.error(`API error ${err.status}: ${err.message}`);
  } else {
    throw err;
  }
}
```

| Error Class              | HTTP Status | When                           |
| ------------------------ | ----------- | ------------------------------ |
| `LysticaAuthError`       | 401         | Missing or invalid API key     |
| `LysticaForbiddenError`  | 403         | Insufficient scope or IP block |
| `LysticaNotFoundError`   | 404         | Resource does not exist        |
| `LysticaValidationError` | 422         | Invalid request data           |
| `LysticaRateLimitError`  | 429         | Rate limit exceeded            |
| `LysticaError`           | any         | All other API errors           |
| `LysticaNetworkError`    | —           | Network failure or timeout     |

---

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  Contact,
  Company,
  Email,
  ContactList,
  CreateContactData,
  SendEmailData,
  PaginatedResponse,
  LysticaConfig,
} from "lystica-cloud";
```

---

## Environments

Works in Node.js 18+ and any runtime with a global `fetch` implementation.

```typescript
// Node.js
const lystica = new LysticaCloud({ apiKey: process.env.LYSTICA_API_KEY! });

// Next.js (server components / API routes / middleware)
const lystica = new LysticaCloud({ apiKey: process.env.LYSTICA_API_KEY! });

// Deno
const lystica = new LysticaCloud({ apiKey: Deno.env.get("LYSTICA_API_KEY")! });

// Bun
const lystica = new LysticaCloud({ apiKey: Bun.env.LYSTICA_API_KEY! });
```

> **Security:** Never expose your API key in client-side / browser code. Always call the Lystica API from a server or serverless function.

---

## Examples

See the [`examples/`](./examples) directory for complete, runnable examples:

- **[basic-usage.ts](./examples/basic-usage.ts)** — Getting started
- **[contacts-crud.ts](./examples/contacts-crud.ts)** — Full CRUD on contacts
- **[send-email.ts](./examples/send-email.ts)** — Sending emails
- **[pagination.ts](./examples/pagination.ts)** — Manual and automatic pagination
- **[error-handling.ts](./examples/error-handling.ts)** — Error handling patterns

---

## Contributing

```bash
git clone https://github.com/Lupleg/lystica-cloud-sdk.git
cd lystica-cloud-sdk
npm install
npm run build
npm test
```

---

## License

MIT — see [LICENSE](./LICENSE) for details.
