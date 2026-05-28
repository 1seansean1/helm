// Provider abstraction for Helm Sandbox.
// Today: Anthropic (direct browser) + OpenRouter (cross-provider proxy).
// All providers stream by SSE; events are normalised into a single ChatEvent shape.

export type Role = "user" | "assistant" | "system" | "tool";

export interface ToolDef {
  name: string;
  description: string;
  /** JSON schema for the tool's input. */
  input_schema: object;
}

export interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: unknown;
}
export interface TextBlock {
  type: "text";
  text: string;
}
export interface ToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}
export type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock;

export interface ChatMessage {
  id: string;
  role: Role;
  /** Either plain text OR an array of content blocks (Anthropic format).
   * Adapters normalise OpenAI-style providers to plain-text content. */
  content: string | ContentBlock[];
  ts: number;
}

export interface ChatRequest {
  apiKey: string;
  model: string;
  system: string;
  messages: ChatMessage[];
  max_tokens: number;
  temperature: number;
  tools?: ToolDef[];
}

export type ChatEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_use_start"; id: string; name: string }
  | { type: "tool_use_input_delta"; id: string; partial_json: string }
  | { type: "tool_use_done"; id: string; name: string; input: unknown }
  | { type: "stop_reason"; reason: string }
  | { type: "usage"; input_tokens: number; output_tokens: number }
  | { type: "error"; message: string; status?: number };

export interface Provider {
  id: "anthropic" | "openrouter";
  label: string;
  supportsTools: boolean;
  /** Curated list of model IDs to surface in the picker; users may type any ID. */
  curatedModels: { id: string; label: string }[];
  /** Required Authorization header description shown in Settings. */
  keyLabel: string;
  keyHint: string;
  /** Streaming generator. Yields ChatEvents until done. Caller is responsible for AbortController. */
  streamChat(req: ChatRequest, signal: AbortSignal): AsyncGenerator<ChatEvent, void, void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SSE line iterator over a ReadableStream.
// ─────────────────────────────────────────────────────────────────────────────

async function* sseLines(stream: ReadableStream<Uint8Array>): AsyncGenerator<string, void, void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let buf = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buf.indexOf("\n\n")) !== -1) {
        const block = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        for (const line of block.split("\n")) {
          if (line.startsWith("data:")) yield line.slice(5).trim();
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Anthropic adapter (direct browser, tool-use capable)
// ─────────────────────────────────────────────────────────────────────────────

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export const AnthropicProvider: Provider = {
  id: "anthropic",
  label: "Anthropic (Claude, direct)",
  supportsTools: true,
  keyLabel: "Anthropic API key",
  keyHint: "Get one at console.anthropic.com. Starts with sk-ant-.",
  curatedModels: [
    { id: "claude-opus-4-7",            label: "Opus 4.7 — deep reasoning, 1M context" },
    { id: "claude-sonnet-4-6",          label: "Sonnet 4.6 — workhorse" },
    { id: "claude-haiku-4-5-20251001",  label: "Haiku 4.5 — fast + cheap" },
  ],

  async *streamChat(req, signal) {
    if (!req.apiKey) {
      yield { type: "error", message: "No Anthropic API key set. Open Settings to add one." };
      return;
    }

    const body: Record<string, unknown> = {
      model: req.model,
      max_tokens: req.max_tokens,
      temperature: req.temperature,
      system: req.system || undefined,
      stream: true,
      messages: req.messages.map((m) => ({
        role: m.role === "tool" ? "user" : m.role,
        content: m.content,
      })),
    };
    if (req.tools?.length) body.tools = req.tools;

    let res: Response;
    try {
      res = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": req.apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(body),
        signal,
      });
    } catch (e) {
      yield { type: "error", message: e instanceof Error ? e.message : String(e) };
      return;
    }

    if (!res.ok || !res.body) {
      let detail = "";
      try { detail = JSON.stringify(await res.json()); } catch { detail = await res.text(); }
      yield { type: "error", status: res.status, message: friendlyAnthropicError(res.status, detail) };
      return;
    }

    // Anthropic events come tagged but ChatGPT-style SSE parsing on the data line
    // is enough — every event has a JSON payload with a `type` discriminator.
    const partialInputs: Record<string, { name: string; json: string }> = {};

    for await (const data of sseLines(res.body)) {
      if (!data) continue;
      let evt: any;
      try { evt = JSON.parse(data); } catch { continue; }
      switch (evt.type) {
        case "content_block_start": {
          const cb = evt.content_block;
          if (cb?.type === "tool_use") {
            partialInputs[evt.index] = { name: cb.name, json: "" };
            yield { type: "tool_use_start", id: cb.id, name: cb.name };
          }
          break;
        }
        case "content_block_delta": {
          const d = evt.delta;
          if (d?.type === "text_delta" && typeof d.text === "string") {
            yield { type: "text_delta", text: d.text };
          } else if (d?.type === "input_json_delta" && typeof d.partial_json === "string") {
            const slot = partialInputs[evt.index];
            if (slot) {
              slot.json += d.partial_json;
              yield { type: "tool_use_input_delta", id: String(evt.index), partial_json: d.partial_json };
            }
          }
          break;
        }
        case "content_block_stop": {
          const slot = partialInputs[evt.index];
          if (slot) {
            let parsed: unknown = {};
            try { parsed = slot.json ? JSON.parse(slot.json) : {}; } catch { parsed = { _raw: slot.json }; }
            yield { type: "tool_use_done", id: String(evt.index), name: slot.name, input: parsed };
            delete partialInputs[evt.index];
          }
          break;
        }
        case "message_delta": {
          if (evt.delta?.stop_reason) yield { type: "stop_reason", reason: evt.delta.stop_reason };
          if (evt.usage?.output_tokens != null) {
            yield { type: "usage", input_tokens: evt.usage.input_tokens ?? 0, output_tokens: evt.usage.output_tokens };
          }
          break;
        }
        case "message_start": {
          if (evt.message?.usage) {
            yield {
              type: "usage",
              input_tokens: evt.message.usage.input_tokens ?? 0,
              output_tokens: evt.message.usage.output_tokens ?? 0,
            };
          }
          break;
        }
        case "error": {
          yield { type: "error", message: evt.error?.message || "Anthropic stream error" };
          return;
        }
      }
    }
  },
};

function friendlyAnthropicError(status: number, detail: string): string {
  if (status === 401) return "Anthropic rejected the API key. Double-check it in Settings (starts with sk-ant-).";
  if (status === 429) return "Rate limited by Anthropic. Wait a moment and try again.";
  if (status === 400) return `Bad request: ${detail.slice(0, 200)}`;
  return `Anthropic returned ${status}: ${detail.slice(0, 200)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// OpenRouter adapter (OpenAI-compatible /chat/completions)
// ─────────────────────────────────────────────────────────────────────────────

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const OpenRouterProvider: Provider = {
  id: "openrouter",
  label: "OpenRouter (GPT-5, Gemini, Llama, ...)",
  supportsTools: false, // text only for v1 of Sandbox
  keyLabel: "OpenRouter API key",
  keyHint: "Get one at openrouter.ai/keys. One key for ~100 models including GPT-5 and Gemini.",
  curatedModels: [
    { id: "openai/gpt-5",                     label: "GPT-5" },
    { id: "openai/gpt-5-mini",                label: "GPT-5 mini — fast + cheap" },
    { id: "google/gemini-2.5-pro",            label: "Gemini 2.5 Pro" },
    { id: "google/gemini-2.5-flash",          label: "Gemini 2.5 Flash" },
    { id: "anthropic/claude-opus-4.7",        label: "Claude Opus 4.7 (via OR)" },
    { id: "anthropic/claude-sonnet-4.6",      label: "Claude Sonnet 4.6 (via OR)" },
    { id: "meta-llama/llama-4-maverick",      label: "Llama 4 Maverick" },
    { id: "mistralai/mistral-large",          label: "Mistral Large" },
    { id: "deepseek/deepseek-r1",             label: "DeepSeek R1" },
    { id: "x-ai/grok-3",                      label: "Grok 3" },
  ],

  async *streamChat(req, signal) {
    if (!req.apiKey) {
      yield { type: "error", message: "No OpenRouter API key set. Open Settings to add one." };
      return;
    }
    // OpenAI-style messages; collapse Anthropic content-block messages into text.
    const messages: { role: string; content: string }[] = [];
    if (req.system?.trim()) messages.push({ role: "system", content: req.system });
    for (const m of req.messages) {
      const text =
        typeof m.content === "string"
          ? m.content
          : m.content.map((c) => (c.type === "text" ? c.text : "")).join("");
      messages.push({ role: m.role === "tool" ? "user" : m.role, content: text });
    }

    let res: Response;
    try {
      res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${req.apiKey}`,
          "HTTP-Referer": "https://1seansean1.github.io/helm/",
          "X-Title": "Helm",
        },
        body: JSON.stringify({
          model: req.model,
          messages,
          max_tokens: req.max_tokens,
          temperature: req.temperature,
          stream: true,
          usage: { include: true },
        }),
        signal,
      });
    } catch (e) {
      yield { type: "error", message: e instanceof Error ? e.message : String(e) };
      return;
    }

    if (!res.ok || !res.body) {
      let detail = "";
      try { detail = JSON.stringify(await res.json()); } catch { detail = await res.text(); }
      yield { type: "error", status: res.status, message: friendlyORError(res.status, detail) };
      return;
    }

    let lastUsage: { input_tokens: number; output_tokens: number } | null = null;
    for await (const data of sseLines(res.body)) {
      if (!data || data === "[DONE]") continue;
      let evt: any;
      try { evt = JSON.parse(data); } catch { continue; }
      const delta = evt.choices?.[0]?.delta?.content;
      if (typeof delta === "string" && delta.length) {
        yield { type: "text_delta", text: delta };
      }
      const finish = evt.choices?.[0]?.finish_reason;
      if (finish) yield { type: "stop_reason", reason: finish };
      if (evt.usage) {
        lastUsage = {
          input_tokens: evt.usage.prompt_tokens ?? 0,
          output_tokens: evt.usage.completion_tokens ?? 0,
        };
      }
    }
    if (lastUsage) yield { type: "usage", ...lastUsage };
  },
};

function friendlyORError(status: number, detail: string): string {
  if (status === 401) return "OpenRouter rejected the API key. Check it in Settings.";
  if (status === 402) return "OpenRouter says your credits are exhausted. Top up at openrouter.ai.";
  if (status === 429) return "Rate limited by OpenRouter. Wait a moment and try again.";
  return `OpenRouter returned ${status}: ${detail.slice(0, 200)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────

export const PROVIDERS: Provider[] = [AnthropicProvider, OpenRouterProvider];
export function providerById(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}
