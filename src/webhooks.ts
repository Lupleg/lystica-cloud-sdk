import type { WebhookEvent } from "./types";

/**
 * Utility for verifying and parsing Lystica webhook payloads.
 *
 * @example
 * ```ts
 * import { Webhooks } from "lystica-cloud";
 *
 * const webhooks = new Webhooks("whsec_your_signing_secret");
 *
 * // In your webhook handler:
 * const event = webhooks.verify(rawBody, signatureHeader, timestampHeader);
 * console.log(event.type, event.data);
 * ```
 */
export class Webhooks {
  private readonly secret: string;

  constructor(signingSecret: string) {
    if (!signingSecret) {
      throw new Error(
        "Webhooks: signingSecret is required. " +
          "Find it at https://lystica.cloud/dashboard/webhooks"
      );
    }
    this.secret = signingSecret;
  }

  /**
   * Verify the webhook signature and parse the event payload.
   * Throws if the signature is invalid or the timestamp is too old.
   *
   * @param rawBody - The raw request body as a string
   * @param signature - The `x-lystica-signature` header value
   * @param timestamp - The `x-lystica-timestamp` header value
   * @param tolerance - Maximum age in seconds (default: 300 = 5 minutes)
   */
  async verify(
    rawBody: string,
    signature: string,
    timestamp: string,
    tolerance = 300
  ): Promise<WebhookEvent> {
    if (!signature || !timestamp) {
      throw new Error("Missing webhook signature or timestamp headers");
    }

    const ts = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);

    if (isNaN(ts) || Math.abs(now - ts) > tolerance) {
      throw new Error(
        "Webhook timestamp is too old or invalid. " +
          "This could indicate a replay attack."
      );
    }

    const payload = `${timestamp}.${rawBody}`;
    const expectedSig = await this.computeHmac(payload);

    if (!this.timingSafeEqual(signature, expectedSig)) {
      throw new Error("Webhook signature verification failed");
    }

    return JSON.parse(rawBody) as WebhookEvent;
  }

  private async computeHmac(payload: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(this.secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    return this.bufferToHex(sig);
  }

  private bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}
