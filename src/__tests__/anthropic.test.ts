import { afterEach, describe, expect, it, vi } from "vitest";
import { AnthropicError, callClaude } from "../lib/anthropic";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Anthropic client (req-set R-05, R-06, R-07)", () => {
  it("hits the canonical endpoint with the required headers and never any other host", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ content: [{ type: "text", text: "hello" }], stop_reason: "end_turn" }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

    const res = await callClaude({
      apiKey: "sk-ant-test-XYZ",
      model: "claude-haiku-4-5-20251001",
      system: "be brief",
      messages: [{ role: "user", content: "hi" }],
      max_tokens: 32,
      temperature: 0,
    });

    expect(res.text).toBe("hello");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    // R-05 + R-06 + R-07: only ever calls api.anthropic.com
    expect(String(url)).toBe("https://api.anthropic.com/v1/messages");
    expect(String(url).startsWith("https://api.anthropic.com/")).toBe(true);

    const headers = init?.headers as Record<string, string>;
    expect(headers["x-api-key"]).toBe("sk-ant-test-XYZ");
    expect(headers["anthropic-version"]).toBe("2023-06-01");
    expect(headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
    expect(headers["content-type"]).toBe("application/json");

    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 32,
      temperature: 0,
      system: "be brief",
      messages: [{ role: "user", content: "hi" }],
    });
  });

  it("throws AnthropicError with a friendly 401 message when key is rejected", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { type: "authentication_error" } }), { status: 401 }),
    );
    await expect(
      callClaude({
        apiKey: "sk-ant-bad",
        model: "claude-haiku-4-5-20251001",
        system: "",
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 16,
        temperature: 0,
      }),
    ).rejects.toBeInstanceOf(AnthropicError);
  });

  it("refuses to call without a key (R-05 precondition)", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    await expect(
      callClaude({
        apiKey: "",
        model: "claude-haiku-4-5-20251001",
        system: "",
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 16,
        temperature: 0,
      }),
    ).rejects.toBeInstanceOf(AnthropicError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
