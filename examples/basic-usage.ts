/**
 * Basic usage of the Lystica Cloud SDK.
 *
 * Run with:
 *   npx tsx examples/basic-usage.ts
 *
 * Make sure LYSTICA_API_KEY is set in your environment.
 */
import { LysticaCloud } from "lystica-cloud";

const lystica = new LysticaCloud({
  apiKey: process.env.LYSTICA_API_KEY!,
});

async function main() {
  // Verify the API key is valid
  const keyInfo = await lystica.verifyKey();
  console.log(`Authenticated as: ${keyInfo.name}`);
  console.log(`Scopes: ${keyInfo.scopes.join(", ")}`);
  console.log();

  // List contacts
  const { data: contacts, meta } = await lystica.contacts.list({
    limit: 10,
    industry: "Technology",
  });

  console.log(`Found ${meta.total} contacts in Technology:`);
  for (const contact of contacts) {
    console.log(`  ${contact.fullName} <${contact.email}> — ${contact.company}`);
  }
  console.log();

  // Search for a specific contact
  const { data: results } = await lystica.contacts.search("engineering");
  console.log(`Search "engineering" returned ${results.length} results`);
  console.log();

  // List companies
  const { data: companies } = await lystica.companies.list({ limit: 5 });
  console.log("Top companies:");
  for (const company of companies) {
    console.log(`  ${company.name} — ${company.industry} (${company.contactCount} contacts)`);
  }
}

main().catch(console.error);
