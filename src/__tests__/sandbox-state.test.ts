import { describe, expect, it } from "vitest";
import { buildEmptyConversation, exportMarkdown } from "../sandbox-state";
import type { ChatMessage } from "../lib/providers";

describe("buildEmptyConversation", () => {
  it("creates a conversation with sensible defaults", () => {
    const c = buildEmptyConversation({
      providerId: "anthropic",
      model: "claude-sonnet-4-6",
      system: "be brief",
      title: "test",
    });
    expect(c.providerId).toBe("anthropic");
    expect(c.model).toBe("claude-sonnet-4-6");
    expect(c.system).toBe("be brief");
    expect(c.title).toBe("test");
    expect(c.messages).toEqual([]);
    expect(c.tools).toEqual([]);
    expect(c.params.temperature).toBeGreaterThanOrEqual(0);
    expect(c.id).toMatch(/^c_/);
  });
});

describe("exportMarkdown", () => {
  it("renders user + assistant text, system prompt, and tool blocks", () => {
    const c = buildEmptyConversation({
      providerId: "anthropic",
      model: "claude-sonnet-4-6",
      system: "you are an agent",
      title: "demo",
      tools: ["get_transaction"],
    });
    const msgs: ChatMessage[] = [
      { id: "1", role: "user", content: "look up TXN-1", ts: 0 },
      {
        id: "2",
        role: "assistant",
        content: [
          { type: "text", text: "calling the tool" },
          { type: "tool_use", id: "tu_1", name: "get_transaction", input: { transaction_id: "TXN-1" } },
        ],
        ts: 0,
      },
      {
        id: "3",
        role: "user",
        content: [
          { type: "tool_result", tool_use_id: "tu_1", content: '{"amount":42}' },
        ],
        ts: 0,
      },
      { id: "4", role: "assistant", content: "The amount is $42.", ts: 0 },
    ];
    const md = exportMarkdown({ ...c, messages: msgs });
    expect(md).toContain("# demo");
    expect(md).toContain("## System");
    expect(md).toContain("you are an agent");
    expect(md).toContain("look up TXN-1");
    expect(md).toContain("calling the tool");
    expect(md).toContain("tool call → get_transaction");
    expect(md).toContain('"transaction_id"');
    expect(md).toContain("tool result");
    expect(md).toContain('"amount":42');
    expect(md).toContain("The amount is $42.");
  });
});
