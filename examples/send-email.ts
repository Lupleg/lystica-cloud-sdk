/**
 * Sending emails with the Lystica Cloud SDK.
 *
 * Run with:
 *   npx tsx examples/send-email.ts
 */
import { LysticaCloud } from "lystica-cloud";

const lystica = new LysticaCloud({
  apiKey: process.env.LYSTICA_API_KEY!,
});

async function main() {
  // Send a single email
  const email = await lystica.emails.send({
    from: "you@yourdomain.com",
    to: "recipient@example.com",
    subject: "Hello from Lystica Cloud",
    html: `
      <h1>Welcome!</h1>
      <p>This email was sent using the Lystica Cloud SDK.</p>
    `,
    text: "Welcome! This email was sent using the Lystica Cloud SDK.",
    tags: ["welcome", "onboarding"],
  });

  console.log(`Email sent: ${email.id}`);
  console.log(`Status: ${email.status}`);

  // Check status later
  const status = await lystica.emails.get(email.id);
  console.log(`Current status: ${status.status}`);

  // List recent emails
  const { data: emails } = await lystica.emails.list({ limit: 5 });
  console.log(`\nRecent emails:`);
  for (const e of emails) {
    console.log(`  ${e.id} — ${e.subject} [${e.status}]`);
  }
}

main().catch(console.error);
