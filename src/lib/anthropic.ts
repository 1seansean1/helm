// Direct browser → Anthropic call.
// The API key never leaves the user's device except as the x-api-key header to api.anthropic.com.

const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeRequest {
  apiKey: string;
  model: string;
  system: string;
  messages: ClaudeMessage[];
  max_tokens: number;
  temperature: number;
}

export interface ClaudeResponse {
  text: string;
  stop_reason?: string;
  usage?: { input_tokens?: number; output_tokens?: number };
  raw: unknown;
}

export class AnthropicError extends Error {
  status: number;
  detail: unknown;
  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
    this.name = "AnthropicError";
  }
}

export async function callClaude(req: ClaudeRequest, signal?: AbortSignal): Promise<ClaudeResponse> {
  if (!req.apiKey) {
    throw new AnthropicError(
      "No API key set. Open Settings and paste an Anthropic API key, or use the Simulated mode.",
      0,
      null,
    );
  }

  const body = {
    model: req.model,
    max_tokens: req.max_tokens,
    temperature: req.temperature,
    system: req.system,
    messages: req.messages,
  };

  let res: Response;
  try {
    res = await fetch(ANTHROPIC_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": req.apiKey,
        "anthropic-version": "2023-06-01",
        // Required when calling the API directly from a browser context.
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    // Network-level failure (CORS preflight, offline, DNS)
    const msg = e instanceof Error ? e.message : String(e);
    throw new AnthropicError(
      `Network call failed: ${msg}. If you're offline, switch to Simulated mode in the exercise.`,
      0,
      e,
    );
  }

  if (!res.ok) {
    let detail: unknown = null;
    try {
      detail = await res.json();
    } catch {
      detail = await res.text();
    }
    const friendly =
      res.status === 401
        ? "API key rejected. Double-check the key in Settings (it should start with sk-ant-)."
        : res.status === 429
          ? "Rate limited. Wait a moment and try again, or switch to Simulated mode."
          : res.status === 400
            ? "Bad request. The model or parameters may be invalid; check Settings."
            : `Anthropic API returned ${res.status}.`;
    throw new AnthropicError(friendly, res.status, detail);
  }

  const json = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
    stop_reason?: string;
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  const text =
    json.content
      ?.filter((c) => c.type === "text" && typeof c.text === "string")
      .map((c) => c.text!)
      .join("\n") ?? "";

  return { text, stop_reason: json.stop_reason, usage: json.usage, raw: json };
}
