/**
 * Demonstrates pagination patterns.
 *
 * Run with:
 *   npx tsx examples/pagination.ts
 */
import { LysticaCloud } from "lystica-cloud";

const lystica = new LysticaCloud({
  apiKey: process.env.LYSTICA_API_KEY!,
});

async function main() {
  // --- Manual cursor-based pagination ---
  console.log("Manual pagination:");
  let cursor: string | undefined;
  let page = 0;

  do {
    const response = await lystica.contacts.list({ limit: 50, cursor });
    page++;
    console.log(`  Page ${page}: ${response.data.length} contacts`);

    cursor = response.meta.cursor ?? undefined;
  } while (cursor);

  console.log();

  // --- Automatic iteration with listAll (async generator) ---
  console.log("Automatic iteration:");
  let count = 0;

  for await (const contact of lystica.contacts.listAll({ industry: "Technology" })) {
    count++;
    if (count <= 3) {
      console.log(`  ${contact.fullName} <${contact.email}>`);
    }
  }

  console.log(`  ... total: ${count} contacts`);
}

main().catch(console.error);
