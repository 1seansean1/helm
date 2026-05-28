import { describe, expect, it } from "vitest";
import { formatCostUSD, PRICING, priceOf } from "../lib/pricing";

describe("priceOf", () => {
  it("computes Anthropic Haiku cost correctly", () => {
    const p = priceOf("claude-haiku-4-5-20251001", { input_tokens: 1_000_000, output_tokens: 1_000_000 });
    expect(p).toBeCloseTo(0.8 + 4.0, 5);
  });
  it("returns null for unknown models", () => {
    expect(priceOf("nope/whatever", { input_tokens: 100, output_tokens: 100 })).toBeNull();
  });
  it("scales linearly with token count", () => {
    const small = priceOf("claude-sonnet-4-6", { input_tokens: 1000, output_tokens: 1000 });
    const big = priceOf("claude-sonnet-4-6", { input_tokens: 10000, output_tokens: 10000 });
    expect(big!).toBeCloseTo(small! * 10, 8);
  });
});

describe("formatCostUSD", () => {
  it("handles null", () => expect(formatCostUSD(null)).toBe("—"));
  it("renders very small amounts as millicents", () => expect(formatCostUSD(0.0001)).toMatch(/m$/));
  it("renders mid amounts with 4 decimals", () => expect(formatCostUSD(0.005)).toMatch(/^\$0\.005/));
  it("renders large amounts with 2 decimals", () => expect(formatCostUSD(12.345)).toBe("$12.35"));
});

describe("PRICING table", () => {
  it("covers the three Anthropic curated models", () => {
    expect(PRICING["claude-opus-4-7"]).toBeDefined();
    expect(PRICING["claude-sonnet-4-6"]).toBeDefined();
    expect(PRICING["claude-haiku-4-5-20251001"]).toBeDefined();
  });
  it("covers GPT-5 and Gemini via OpenRouter", () => {
    expect(PRICING["openai/gpt-5"]).toBeDefined();
    expect(PRICING["google/gemini-2.5-pro"]).toBeDefined();
  });
});
