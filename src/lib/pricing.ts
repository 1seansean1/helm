// Per-model rough pricing in USD per million tokens.
// Inputs first, outputs second. These are approximations; the live API call
// returns authoritative usage and we render the model-listed prices times that.

export interface ModelPricing {
  input_per_mtok: number;
  output_per_mtok: number;
  context_tokens: number; // for display
  label: string;
}

export const PRICING: Record<string, ModelPricing> = {
  // ── Anthropic (direct) ────────────────────────────────────────────────
  "claude-opus-4-7":             { input_per_mtok: 15.0,  output_per_mtok: 75.0,  context_tokens: 1_000_000, label: "Opus 4.7 (1M)" },
  "claude-sonnet-4-6":           { input_per_mtok: 3.0,   output_per_mtok: 15.0,  context_tokens:   200_000, label: "Sonnet 4.6" },
  "claude-haiku-4-5-20251001":   { input_per_mtok: 0.8,   output_per_mtok: 4.0,   context_tokens:   200_000, label: "Haiku 4.5" },

  // ── OpenRouter (cross-provider; values are representative) ────────────
  "anthropic/claude-opus-4.7":             { input_per_mtok: 15.0,  output_per_mtok: 75.0,  context_tokens: 1_000_000, label: "Opus 4.7 (via OR)" },
  "anthropic/claude-sonnet-4.6":           { input_per_mtok: 3.0,   output_per_mtok: 15.0,  context_tokens:   200_000, label: "Sonnet 4.6 (via OR)" },
  "openai/gpt-5":                          { input_per_mtok: 5.0,   output_per_mtok: 15.0,  context_tokens:   400_000, label: "GPT-5" },
  "openai/gpt-5-mini":                     { input_per_mtok: 0.5,   output_per_mtok: 2.0,   context_tokens:   400_000, label: "GPT-5 mini" },
  "google/gemini-2.5-pro":                 { input_per_mtok: 2.5,   output_per_mtok: 10.0,  context_tokens: 2_000_000, label: "Gemini 2.5 Pro" },
  "google/gemini-2.5-flash":               { input_per_mtok: 0.3,   output_per_mtok: 1.2,   context_tokens: 1_000_000, label: "Gemini 2.5 Flash" },
  "meta-llama/llama-4-maverick":           { input_per_mtok: 0.6,   output_per_mtok: 1.8,   context_tokens:   256_000, label: "Llama 4 Maverick" },
  "mistralai/mistral-large":               { input_per_mtok: 2.0,   output_per_mtok: 6.0,   context_tokens:   128_000, label: "Mistral Large" },
  "deepseek/deepseek-r1":                  { input_per_mtok: 0.55,  output_per_mtok: 2.19,  context_tokens:   128_000, label: "DeepSeek R1" },
  "x-ai/grok-3":                           { input_per_mtok: 3.0,   output_per_mtok: 15.0,  context_tokens:   256_000, label: "Grok 3" },
};

export function priceOf(model: string, usage: { input_tokens: number; output_tokens: number }): number | null {
  const p = PRICING[model];
  if (!p) return null;
  return (usage.input_tokens * p.input_per_mtok + usage.output_tokens * p.output_per_mtok) / 1_000_000;
}

export function formatCostUSD(n: number | null): string {
  if (n == null) return "—";
  if (n < 0.001) return `$${(n * 1000).toFixed(3)}m`; // millicents
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(2)}`;
}
