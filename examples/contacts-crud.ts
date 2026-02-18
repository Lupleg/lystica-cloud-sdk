/**
 * Full CRUD operations on contacts.
 *
 * Run with:
 *   npx tsx examples/contacts-crud.ts
 */
import { LysticaCloud, LysticaNotFoundError } from "lystica-cloud";

const lystica = new LysticaCloud({
  apiKey: process.env.LYSTICA_API_KEY!,
});

async function main() {
  // Create a contact
  const contact = await lystica.contacts.create({
    email: "demo@example.com",
    firstName: "Demo",
    lastName: "User",
    company: "Example Corp",
    jobTitle: "Developer",
    industry: "Technology",
    country: "United States",
    tags: ["demo", "sdk-test"],
  });
  console.log(`Created contact: ${contact.id}`);

  // Update the contact
  const updated = await lystica.contacts.update(contact.id, {
    jobTitle: "Senior Developer",
    tags: ["demo", "sdk-test", "updated"],
  });
  console.log(`Updated job title: ${updated.jobTitle}`);

  // Add tags
  const tagged = await lystica.contacts.addTags(contact.id, ["vip"]);
  console.log(`Tags: ${tagged.tags.join(", ")}`);

  // Delete the contact
  await lystica.contacts.delete(contact.id);
  console.log(`Deleted contact: ${contact.id}`);

  // Verify deletion
  try {
    await lystica.contacts.get(contact.id);
  } catch (err) {
    if (err instanceof LysticaNotFoundError) {
      console.log("Confirmed: contact no longer exists");
    }
  }
}

main().catch(console.error);
