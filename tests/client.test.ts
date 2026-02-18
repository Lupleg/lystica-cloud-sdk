import { describe, it, expect } from "vitest";
import { LysticaCloud } from "../src/client";

describe("LysticaCloud", () => {
  it("throws when apiKey is missing", () => {
    expect(() => new LysticaCloud({ apiKey: "" })).toThrow("apiKey is required");
  });

  it("throws when apiKey has wrong prefix", () => {
    expect(() => new LysticaCloud({ apiKey: "sk_invalid_123" })).toThrow(
      "must start with"
    );
  });

  it("accepts a lys_live_ key", () => {
    const client = new LysticaCloud({ apiKey: "lys_live_test123" });
    expect(client).toBeDefined();
    expect(client.contacts).toBeDefined();
    expect(client.companies).toBeDefined();
    expect(client.emails).toBeDefined();
    expect(client.lists).toBeDefined();
  });

  it("accepts a lys_test_ key", () => {
    const client = new LysticaCloud({ apiKey: "lys_test_sandbox456" });
    expect(client).toBeDefined();
    expect(client.contacts).toBeDefined();
  });

  it("exposes all resource namespaces", () => {
    const client = new LysticaCloud({ apiKey: "lys_live_abc" });
    expect(client.contacts).toBeDefined();
    expect(client.companies).toBeDefined();
    expect(client.emails).toBeDefined();
    expect(client.lists).toBeDefined();
  });

  it("exposes verifyKey method", () => {
    const client = new LysticaCloud({ apiKey: "lys_live_abc" });
    expect(typeof client.verifyKey).toBe("function");
  });
});
