import { describe, it, expect, vi, beforeEach } from "vitest";
import { LysticaCloud } from "../../src/client";
import type { PaginatedResponse, Contact } from "../../src/types";

function mockFetchResponse(body: unknown, status = 200) {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

const sampleContact: Contact = {
  id: "cnt_abc123",
  fullName: "Jane Doe",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  company: "Acme Inc",
  jobTitle: "Engineer",
  industry: "Technology",
  country: "US",
  tags: ["vip"],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const listResponse: PaginatedResponse<Contact> = {
  data: [sampleContact],
  meta: { total: 1, limit: 50, cursor: null, hasMore: false },
};

describe("Contacts resource", () => {
  let lystica: LysticaCloud;

  beforeEach(() => {
    vi.restoreAllMocks();
    lystica = new LysticaCloud({
      apiKey: "lys_live_test123",
      baseUrl: "https://api.test.lystica.cloud",
      maxRetries: 0,
    });
  });

  it("lists contacts", async () => {
    mockFetchResponse(listResponse);
    const result = await lystica.contacts.list({ limit: 50 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].email).toBe("jane@example.com");
  });

  it("gets a single contact", async () => {
    mockFetchResponse(sampleContact);
    const result = await lystica.contacts.get("cnt_abc123");
    expect(result.id).toBe("cnt_abc123");
    expect(result.fullName).toBe("Jane Doe");
  });

  it("creates a contact", async () => {
    mockFetchResponse(sampleContact, 200);
    const result = await lystica.contacts.create({
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Doe",
    });
    expect(result.email).toBe("jane@example.com");

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init?.method).toBe("POST");
  });

  it("updates a contact", async () => {
    const updated = { ...sampleContact, jobTitle: "Senior Engineer" };
    mockFetchResponse(updated);
    const result = await lystica.contacts.update("cnt_abc123", {
      jobTitle: "Senior Engineer",
    });
    expect(result.jobTitle).toBe("Senior Engineer");

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init?.method).toBe("PATCH");
  });

  it("deletes a contact", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 204 })
    );
    await lystica.contacts.delete("cnt_abc123");

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init?.method).toBe("DELETE");
  });

  it("searches contacts", async () => {
    mockFetchResponse(listResponse);
    const result = await lystica.contacts.search("jane");
    expect(result.data).toHaveLength(1);

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect((url as string)).toContain("search=jane");
  });

  it("adds tags to a contact", async () => {
    const withTags = { ...sampleContact, tags: ["vip", "enterprise"] };
    mockFetchResponse(withTags);
    const result = await lystica.contacts.addTags("cnt_abc123", ["enterprise"]);
    expect(result.tags).toContain("enterprise");
  });

  it("iterates all contacts with listAll", async () => {
    const page1: PaginatedResponse<Contact> = {
      data: [sampleContact],
      meta: { total: 2, limit: 200, cursor: "cursor_1", hasMore: true },
    };
    const page2: PaginatedResponse<Contact> = {
      data: [{ ...sampleContact, id: "cnt_def456", fullName: "John Smith" }],
      meta: { total: 2, limit: 200, cursor: null, hasMore: false },
    };

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(page1), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(page2), { status: 200 })
      );

    const contacts: Contact[] = [];
    for await (const contact of lystica.contacts.listAll()) {
      contacts.push(contact);
    }

    expect(contacts).toHaveLength(2);
    expect(contacts[0].id).toBe("cnt_abc123");
    expect(contacts[1].id).toBe("cnt_def456");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
