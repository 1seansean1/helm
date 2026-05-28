import { afterEach, describe, expect, it, vi } from "vitest";
import { AnthropicProvider, OpenRouterProvider, type ChatEvent, type ChatMessage } from "../lib/providers";

afterEach(() => vi.restoreAllMocks());

// Build a ReadableStream<Uint8Array> from a list of SSE text chunks
function sseStream(chunks: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const c of chunks) controller.enqueue(enc.encode(c));
      controller.close();
    },
  });
}

async function collect(gen: AsyncGenerator<ChatEvent, any, any>): Promise<ChatEvent[]> {
  const out: ChatEvent[] = [];
  for await (const e of gen) out.push(e);
  return out;
}

const msg = (role: "user" | "assistant", content: string): ChatMessage => ({
  id: "x",
  role,
  content,
  ts: 0,
});

describe("AnthropicProvider", () => {
  it("requires an API key (no fetch call without one)", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const events = await collect(
      AnthropicProvider.streamChat(
        { apiKey: "", model: "claude-haiku-4-5-20251001", system: "", messages: [msg("user", "hi")], max_tokens: 16, temperature: 0 },
        new AbortController().signal,
      ),
    );
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the dangerous-direct-browser-access header on every call", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(sseStream(['data: {"type":"message_stop"}\n\n']), { status: 200 }),
      );
    await collect(
      AnthropicProvider.streamChat(
        { apiKey: "sk-ant-test", model: "claude-haiku-4-5-20251001", system: "be brief", messages: [msg("user", "hi")], max_tokens: 16, temperature: 0 },
        new AbortController().signal,
      ),
    );
    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://api.anthropic.com/v1/messages");
    expect(headers["x-api-key"]).toBe("sk-ant-test");
    expect(headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
    expect(headers["anthropic-version"]).toBe("2023-06-01");
  });

  it("parses content_block_delta text events into text_delta", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        sseStream([
          'data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}\n\n',
          'data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":", world"}}\n\n',
          'data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":7,"input_tokens":3}}\n\n',
          'data: {"type":"message_stop"}\n\n',
        ]),
        { status: 200 },
      ),
    );
    const events = await collect(
      AnthropicProvider.streamChat(
        { apiKey: "sk-ant", model: "claude-haiku-4-5-20251001", system: "", messages: [msg("user", "x")], max_tokens: 16, temperature: 0 },
        new AbortController().signal,
      ),
    );
    const texts = events.filter((e) => e.type === "text_delta").map((e) => (e as any).text);
    expect(texts.join("")).toBe("Hello, world");
    const stop = events.find((e) => e.type === "stop_reason") as any;
    expect(stop.reason).toBe("end_turn");
    const usage = events.find((e) => e.type === "usage") as any;
    expect(usage.output_tokens).toBe(7);
  });

  it("yields tool_use_start + tool_use_done when the assistant calls a tool", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        sseStream([
          'data: {"type":"content_block_start","index":0,"content_block":{"type":"tool_use","id":"tu_1","name":"get_transaction","input":{}}}\n\n',
          'data: {"type":"content_block_delta","index":0,"delta":{"type":"input_json_delta","partial_json":"{\\"transaction_id\\":\\"TXN-1\\"}"}}\n\n',
          'data: {"type":"content_block_stop","index":0}\n\n',
          'data: {"type":"message_delta","delta":{"stop_reason":"tool_use"}}\n\n',
        ]),
        { status: 200 },
      ),
    );
    const events = await collect(
      AnthropicProvider.streamChat(
        { apiKey: "sk-ant", model: "claude-haiku-4-5-20251001", system: "", messages: [msg("user", "look it up")], max_tokens: 16, temperature: 0 },
        new AbortController().signal,
      ),
    );
    const start = events.find((e) => e.type === "tool_use_start") as any;
    const done = events.find((e) => e.type === "tool_use_done") as any;
    expect(start.name).toBe("get_transaction");
    expect(done.input).toEqual({ transaction_id: "TXN-1" });
  });

  it("surfaces a friendly error on 401", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { message: "auth" } }), { status: 401 }),
    );
    const events = await collect(
      AnthropicProvider.streamChat(
        { apiKey: "bad", model: "claude-haiku-4-5-20251001", system: "", messages: [msg("user", "x")], max_tokens: 16, temperature: 0 },
        new AbortController().signal,
      ),
    );
    expect(events[0].type).toBe("error");
    expect((events[0] as any).status).toBe(401);
    expect((events[0] as any).message).toMatch(/rejected/i);
  });
});

describe("OpenRouterProvider", () => {
  it("sends Bearer auth, HTTP-Referer + X-Title, no Anthropic header", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(sseStream(["data: [DONE]\n\n"]), { status: 200 }),
      );
    await collect(
      OpenRouterProvider.streamChat(
        { apiKey: "sk-or-test", model: "openai/gpt-5-mini", system: "", messages: [msg("user", "hi")], max_tokens: 16, temperature: 0 },
        new AbortController().signal,
      ),
    );
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://openrouter.ai/api/v1/chat/completions");
    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers["authorization"]).toBe("Bearer sk-or-test");
    expect(headers["HTTP-Referer"]).toMatch(/1seansean1\.github\.io\/helm/);
    expect(headers["X-Title"]).toBe("Helm");
    expect((headers as any)["anthropic-dangerous-direct-browser-access"]).toBeUndefined();
  });

  it("parses OpenAI-format streaming deltas + final usage", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        sseStream([
          'data: {"choices":[{"delta":{"content":"hi"},"index":0,"finish_reason":null}]}\n\n',
          'data: {"choices":[{"delta":{"content":" there"},"index":0,"finish_reason":null}]}\n\n',
          'data: {"choices":[{"delta":{},"index":0,"finish_reason":"stop"}],"usage":{"prompt_tokens":4,"completion_tokens":2}}\n\n',
          "data: [DONE]\n\n",
        ]),
        { status: 200 },
      ),
    );
    const events = await collect(
      OpenRouterProvider.streamChat(
        { apiKey: "sk-or", model: "openai/gpt-5-mini", system: "you are a bot", messages: [msg("user", "x")], max_tokens: 16, temperature: 0 },
        new AbortController().signal,
      ),
    );
    const text = events.filter((e) => e.type === "text_delta").map((e) => (e as any).text).join("");
    expect(text).toBe("hi there");
    const usage = events.find((e) => e.type === "usage") as any;
    expect(usage.input_tokens).toBe(4);
    expect(usage.output_tokens).toBe(2);
  });

  it("collapses Anthropic-block messages to text when forwarding to OpenAI-style API", async () => {
    let captured: any = null;
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(async (_url, init) => {
      captured = JSON.parse(String((init as any)?.body));
      return new Response(sseStream(["data: [DONE]\n\n"]), { status: 200 });
    });
    const m: ChatMessage = {
      id: "x",
      role: "assistant",
      content: [{ type: "text", text: "ok" }],
      ts: 0,
    };
    await collect(
      OpenRouterProvider.streamChat(
        { apiKey: "sk-or", model: "openai/gpt-5-mini", system: "sys", messages: [m], max_tokens: 16, temperature: 0 },
        new AbortController().signal,
      ),
    );
    expect(captured.messages[0]).toEqual({ role: "system", content: "sys" });
    expect(captured.messages[1]).toEqual({ role: "assistant", content: "ok" });
  });
});
