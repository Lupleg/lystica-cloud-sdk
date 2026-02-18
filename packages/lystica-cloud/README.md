# lystica-cloud

Official Node.js / TypeScript SDK for the [Lystica Cloud](https://lystica.cloud) API.

Access professional contacts programmatically and integrate them into your own applications, CRMs, and workflows.

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
  apiKey: "lys_live_YOUR_API_KEY",
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

## API Reference

### `new LysticaCloud(config)`

| Option       | Type     | Default                  | Description                         |
| ------------ | -------- | ------------------------ | ----------------------------------- |
| `apiKey`     | `string` | —                        | **Required.** Your Lystica API key. |
| `baseUrl`    | `string` | `https://lystica.cloud`  | API base URL.                       |
| `timeout`    | `number` | `30000`                  | Request timeout in ms.              |
| `maxRetries` | `number` | `2`                      | Auto-retries on 5xx / network errors. |

---

### `lystica.contacts.list(params?)`

Fetch contacts with optional filters.

```typescript
const { data, meta } = await lystica.contacts.list({
  limit: 100,
  industry: "Finance",
  country: "United States",
});
```

**Parameters:**

| Param      | Type     | Default | Description                                |
| ---------- | -------- | ------- | ------------------------------------------ |
| `limit`    | `number` | `50`    | Max results (1–200).                       |
| `industry` | `string` | —       | Filter by industry.                        |
| `country`  | `string` | —       | Filter by country.                         |
| `company`  | `string` | —       | Filter by company name.                    |
| `search`   | `string` | —       | Search name, email, company, or job title. |

**Returns:** `ListContactsResponse`

```typescript
{
  data: Contact[];
  meta: {
    total: number;
    limit: number;
    filters: Record<string, string>;
  };
}
```

---

### `lystica.contacts.search(query, params?)`

Shorthand for `list({ search: query, ...params })`.

```typescript
const { data } = await lystica.contacts.search("jane@example.com");
```

---

### `lystica.contacts.listAll(params?)`

Fetch all matching contacts in a single call (limit set to max 200).

```typescript
const contacts = await lystica.contacts.listAll({
  industry: "Healthcare",
});
```

## Contact Type

```typescript
interface Contact {
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
```

## Error Handling

The SDK throws typed errors you can catch individually:

```typescript
import {
  LysticaCloud,
  LysticaAuthError,
  LysticaRateLimitError,
  LysticaError,
} from "lystica-cloud";

const lystica = new LysticaCloud({ apiKey: "lys_live_..." });

try {
  const { data } = await lystica.contacts.list();
} catch (err) {
  if (err instanceof LysticaAuthError) {
    console.error("Invalid API key");
  } else if (err instanceof LysticaRateLimitError) {
    console.error("Rate limit exceeded — slow down");
  } else if (err instanceof LysticaError) {
    console.error(`API error ${err.status}: ${err.message}`);
  } else {
    throw err;
  }
}
```

| Error Class              | HTTP Status | When                         |
| ------------------------ | ----------- | ---------------------------- |
| `LysticaAuthError`       | 401         | Missing or invalid API key   |
| `LysticaForbiddenError`  | 403         | Insufficient scope or IP block |
| `LysticaRateLimitError`  | 429         | Rate limit exceeded          |
| `LysticaError`           | any         | All other API errors         |
| `LysticaNetworkError`    | —           | Network failure or timeout   |

## Environments

Works in Node.js 18+ and modern browsers/edge runtimes that support `fetch`.

```typescript
// Node.js
const lystica = new LysticaCloud({ apiKey: process.env.LYSTICA_API_KEY! });

// Next.js server component / API route
const lystica = new LysticaCloud({ apiKey: process.env.LYSTICA_API_KEY! });

// Deno
const lystica = new LysticaCloud({ apiKey: Deno.env.get("LYSTICA_API_KEY")! });
```

> **Never expose your API key in client-side / browser code.** Always call the Lystica API from a server or serverless function.

## License

MIT
