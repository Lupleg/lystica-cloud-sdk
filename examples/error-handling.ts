/**
 * Demonstrates error handling patterns with the SDK.
 *
 * Run with:
 *   npx tsx examples/error-handling.ts
 */
import {
  LysticaCloud,
  LysticaAuthError,
  LysticaForbiddenError,
  LysticaNotFoundError,
  LysticaRateLimitError,
  LysticaValidationError,
  LysticaError,
  LysticaNetworkError,
} from "lystica-cloud";

async function main() {
  // 1. Handle invalid API key at construction time
  try {
    new LysticaCloud({ apiKey: "bad_key" });
  } catch (err) {
    console.log("Construction error:", (err as Error).message);
  }

  // 2. Handle API errors at request time
  const lystica = new LysticaCloud({
    apiKey: process.env.LYSTICA_API_KEY!,
  });

  try {
    await lystica.contacts.get("cnt_nonexistent");
  } catch (err) {
    if (err instanceof LysticaAuthError) {
      console.error("Invalid or expired API key");
    } else if (err instanceof LysticaForbiddenError) {
      console.error("Insufficient permissions for this operation");
    } else if (err instanceof LysticaNotFoundError) {
      console.error("Contact not found");
    } else if (err instanceof LysticaValidationError) {
      console.error("Invalid request data:", err.message);
    } else if (err instanceof LysticaRateLimitError) {
      console.error("Rate limit exceeded — implement backoff");
    } else if (err instanceof LysticaNetworkError) {
      console.error("Network issue:", err.message);
    } else if (err instanceof LysticaError) {
      console.error(`API error ${err.status}: ${err.message}`);
    } else {
      throw err;
    }
  }
}

main().catch(console.error);
