import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpClient } from "../src/http";
import { LysticaAuthError, LysticaRateLimitError, LysticaNotFoundError, LysticaNetworkError } from "../src/errors";

function createClient(overrides?: { baseUrl?: string; timeout?: number; maxRetries?: number }) {
  return new HttpClient({
    apiKey: "lys_live_test123",
    baseUrl: "https://api.test.lystica.cloud",
    maxRetries: 0,
    ...overrides,
  });
}

describe("HttpClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends correct authorization header", async () => {
    const client = createClient();
    const mockResponse = { data: [] };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await client.request({ method: "GET", path: "/api/v1/contacts" });

    expect(fetch).toHaveBeenCalledOnce();
    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect((init?.headers as Record<string, string>)["Authorization"]).toBe(
      "Bearer lys_live_test123"
    );
  });

  it("builds URL with query params", async () => {
    const client = createClient();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await client.request({
      method: "GET",
      path: "/api/v1/contacts",
      params: { limit: 10, industry: "Tech", empty: undefined },
    });

    const [url] = vi.mocked(fetch).mock.calls[0];
    const parsed = new URL(url as string);
    expect(parsed.searchParams.get("limit")).toBe("10");
    expect(parsed.searchParams.get("industry")).toBe("Tech");
    expect(parsed.searchParams.has("empty")).toBe(false);
  });

  it("throws LysticaAuthError on 401", async () => {
    const client = createClient();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 })
    );

    await expect(
      client.request({ method: "GET", path: "/test" })
    ).rejects.toThrow(LysticaAuthError);
  });

  it("throws LysticaNotFoundError on 404", async () => {
    const client = createClient();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "not_found" }), { status: 404 })
    );

    await expect(
      client.request({ method: "GET", path: "/test" })
    ).rejects.toThrow(LysticaNotFoundError);
  });

  it("throws LysticaRateLimitError on 429", async () => {
    const client = createClient();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "rate_limited" }), { status: 429 })
    );

    await expect(
      client.request({ method: "GET", path: "/test" })
    ).rejects.toThrow(LysticaRateLimitError);
  });

  it("returns undefined for 204 responses", async () => {
    const client = createClient();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 204 })
    );

    const result = await client.request({ method: "DELETE", path: "/test" });
    expect(result).toBeUndefined();
  });

  it("sends JSON body for POST requests", async () => {
    const client = createClient();
    const body = { email: "test@example.com", firstName: "Test" };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "cnt_1" }), { status: 200 })
    );

    await client.request({ method: "POST", path: "/test", body });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init?.body).toBe(JSON.stringify(body));
  });

  it("retries on 503 when maxRetries > 0", async () => {
    const client = createClient({ maxRetries: 1 });

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "unavailable" }), { status: 503 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: "ok" }), { status: 200 })
      );

    const result = await client.request({ method: "GET", path: "/test" });
    expect(result).toEqual({ data: "ok" });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("throws LysticaNetworkError on fetch failure", async () => {
    const client = createClient();

    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new TypeError("Failed to fetch")
    );

    await expect(
      client.request({ method: "GET", path: "/test" })
    ).rejects.toThrow(LysticaNetworkError);
  });
});
