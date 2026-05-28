// Claude model catalog exposed in Helm.
// IDs are the public 4.x family; defaults to Haiku for cheap/fast learning loops.

export interface ModelEntry {
  id: ModelId;
  label: string;
  family: "opus" | "sonnet" | "haiku";
  blurb: string;
  context_tokens: string;
  good_for: string;
}

export type ModelId =
  | "claude-opus-4-7"
  | "claude-sonnet-4-6"
  | "claude-haiku-4-5-20251001";

export const MODELS: ModelEntry[] = [
  {
    id: "claude-opus-4-7",
    label: "Claude Opus 4.7",
    family: "opus",
    blurb: "Highest capability; deep reasoning, longest tasks.",
    context_tokens: "1M",
    good_for: "Regulatory drafting, multi-document analysis, long agentic runs.",
  },
  {
    id: "claude-sonnet-4-6",
    label: "Claude Sonnet 4.6",
    family: "sonnet",
    blurb: "Strong all-rounder; the production workhorse.",
    context_tokens: "200k",
    good_for: "Customer support, drafting, classification, mid-complexity reasoning.",
  },
  {
    id: "claude-haiku-4-5-20251001",
    label: "Claude Haiku 4.5",
    family: "haiku",
    blurb: "Fast and inexpensive; sub-second responses.",
    context_tokens: "200k",
    good_for: "Real-time categorization, lightweight extraction, learning loops.",
  },
];

export const DEFAULT_MODEL: ModelId = "claude-haiku-4-5-20251001";

export function modelById(id: string): ModelEntry | undefined {
  return MODELS.find((m) => m.id === id);
}
