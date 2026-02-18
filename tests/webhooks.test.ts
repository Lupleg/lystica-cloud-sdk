import { describe, it, expect } from "vitest";
import { Webhooks } from "../src/webhooks";

const SECRET = "whsec_test_secret_123";

async function computeTestSignature(
  secret: string,
  timestamp: string,
  body: string
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${timestamp}.${body}`)
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

describe("Webhooks", () => {
  it("throws when signingSecret is missing", () => {
    expect(() => new Webhooks("")).toThrow("signingSecret is required");
  });

  it("verifies a valid webhook payload", async () => {
    const webhooks = new Webhooks(SECRET);
    const body = JSON.stringify({
      id: "evt_123",
      type: "contact.created",
      data: { contactId: "cnt_abc" },
      createdAt: "2026-01-01T00:00:00Z",
    });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = await computeTestSignature(SECRET, timestamp, body);

    const event = await webhooks.verify(body, signature, timestamp);
    expect(event.type).toBe("contact.created");
    expect(event.id).toBe("evt_123");
  });

  it("rejects an invalid signature", async () => {
    const webhooks = new Webhooks(SECRET);
    const body = '{"id":"evt_123","type":"test","data":{},"createdAt":"2026-01-01T00:00:00Z"}';
    const timestamp = String(Math.floor(Date.now() / 1000));

    await expect(
      webhooks.verify(body, "invalid_signature_hex", timestamp)
    ).rejects.toThrow("signature verification failed");
  });

  it("rejects an expired timestamp", async () => {
    const webhooks = new Webhooks(SECRET);
    const body = '{"id":"evt_123","type":"test","data":{},"createdAt":"2026-01-01T00:00:00Z"}';
    const oldTimestamp = String(Math.floor(Date.now() / 1000) - 600);
    const signature = await computeTestSignature(SECRET, oldTimestamp, body);

    await expect(
      webhooks.verify(body, signature, oldTimestamp)
    ).rejects.toThrow("too old");
  });

  it("rejects missing headers", async () => {
    const webhooks = new Webhooks(SECRET);
    await expect(webhooks.verify("{}", "", "123")).rejects.toThrow("Missing");
    await expect(webhooks.verify("{}", "abc", "")).rejects.toThrow("Missing");
  });
});
