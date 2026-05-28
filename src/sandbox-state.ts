// Sandbox conversation store — keeps every conversation in localStorage under
// a separate versioned key with a soft size cap. The main HelmState (state.ts)
// owns provider keys and per-provider defaults.

import { useCallback, useEffect, useState } from "react";
import type { ChatMessage } from "./lib/providers";

const STORAGE_KEY = "helm.v1.conversations";
const SOFT_CAP_BYTES = 4_000_000; // ~4 MB
const KEEP_AT_LEAST = 3;

export interface SandboxConversation {
  id: string;
  title: string;
  providerId: "anthropic" | "openrouter";
  model: string;
  system: string;
  messages: ChatMessage[];
  params: { temperature: number; max_tokens: number };
  tools: string[]; // active tool names
  createdAt: number;
  updatedAt: number;
}

export interface ConversationsState {
  version: 1;
  conversations: SandboxConversation[];
  activeId: string | null;
}

const FALLBACK: ConversationsState = { version: 1, conversations: [], activeId: null };

function load(): ConversationsState {
  if (typeof window === "undefined") return FALLBACK;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return FALLBACK;
    const parsed = JSON.parse(raw) as ConversationsState;
    if (parsed.version !== 1) return FALLBACK;
    return { ...FALLBACK, ...parsed };
  } catch {
    return FALLBACK;
  }
}

function persist(state: ConversationsState) {
  if (typeof window === "undefined") return;
  try {
    let payload = JSON.stringify(state);
    if (payload.length > SOFT_CAP_BYTES && state.conversations.length > KEEP_AT_LEAST) {
      // Evict oldest until under cap or we hit the keep-floor.
      const sorted = [...state.conversations].sort((a, b) => a.updatedAt - b.updatedAt);
      while (payload.length > SOFT_CAP_BYTES && sorted.length > KEEP_AT_LEAST) {
        sorted.shift();
        const next = { ...state, conversations: sorted };
        payload = JSON.stringify(next);
      }
    }
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    /* quota: best-effort */
  }
}

export function newId(): string {
  return "c_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function defaultTitle(seed: string): string {
  return seed.trim().slice(0, 48) || "New conversation";
}

export function useConversations() {
  const [state, setState] = useState<ConversationsState>(load);

  useEffect(() => persist(state), [state]);

  const upsert = useCallback((c: SandboxConversation) => {
    setState((s) => {
      const without = s.conversations.filter((x) => x.id !== c.id);
      return { ...s, conversations: [c, ...without] };
    });
  }, []);

  const remove = useCallback((id: string) => {
    setState((s) => {
      const conversations = s.conversations.filter((x) => x.id !== id);
      const activeId = s.activeId === id ? (conversations[0]?.id ?? null) : s.activeId;
      return { ...s, conversations, activeId };
    });
  }, []);

  const setActive = useCallback((id: string | null) => {
    setState((s) => ({ ...s, activeId: id }));
  }, []);

  const get = useCallback(
    (id: string | null): SandboxConversation | null => {
      if (!id) return null;
      return state.conversations.find((c) => c.id === id) ?? null;
    },
    [state.conversations],
  );

  const appendMessage = useCallback(
    (id: string, msg: ChatMessage) => {
      setState((s) => {
        const conv = s.conversations.find((c) => c.id === id);
        if (!conv) return s;
        const updated: SandboxConversation = {
          ...conv,
          messages: [...conv.messages, msg],
          updatedAt: Date.now(),
        };
        return {
          ...s,
          conversations: [updated, ...s.conversations.filter((c) => c.id !== id)],
        };
      });
    },
    [],
  );

  const updateMessage = useCallback(
    (id: string, msgId: string, mutate: (m: ChatMessage) => ChatMessage) => {
      setState((s) => {
        const conv = s.conversations.find((c) => c.id === id);
        if (!conv) return s;
        const messages = conv.messages.map((m) => (m.id === msgId ? mutate(m) : m));
        const updated: SandboxConversation = { ...conv, messages, updatedAt: Date.now() };
        return {
          ...s,
          conversations: [updated, ...s.conversations.filter((c) => c.id !== id)],
        };
      });
    },
    [],
  );

  const rename = useCallback((id: string, title: string) => {
    setState((s) => {
      const conv = s.conversations.find((c) => c.id === id);
      if (!conv) return s;
      const updated = { ...conv, title: title.slice(0, 80), updatedAt: Date.now() };
      return {
        ...s,
        conversations: s.conversations.map((c) => (c.id === id ? updated : c)),
      };
    });
  }, []);

  const updateConfig = useCallback(
    (
      id: string,
      patch: Partial<Pick<SandboxConversation, "system" | "params" | "tools" | "model" | "providerId">>,
    ) => {
      setState((s) => {
        const conv = s.conversations.find((c) => c.id === id);
        if (!conv) return s;
        const updated = { ...conv, ...patch, updatedAt: Date.now() };
        return {
          ...s,
          conversations: s.conversations.map((c) => (c.id === id ? updated : c)),
        };
      });
    },
    [],
  );

  const clearAll = useCallback(() => setState(FALLBACK), []);

  return {
    state,
    upsert,
    remove,
    setActive,
    get,
    appendMessage,
    updateMessage,
    rename,
    updateConfig,
    clearAll,
  };
}

// Helpers ---------------------------------------------------------------------

export function buildEmptyConversation(args: {
  providerId: "anthropic" | "openrouter";
  model: string;
  system?: string;
  title?: string;
  temperature?: number;
  max_tokens?: number;
  tools?: string[];
}): SandboxConversation {
  const now = Date.now();
  return {
    id: newId(),
    title: defaultTitle(args.title ?? "New conversation"),
    providerId: args.providerId,
    model: args.model,
    system: args.system ?? "",
    messages: [],
    params: { temperature: args.temperature ?? 0.5, max_tokens: args.max_tokens ?? 1024 },
    tools: args.tools ?? [],
    createdAt: now,
    updatedAt: now,
  };
}

export function exportMarkdown(c: SandboxConversation): string {
  const lines: string[] = [];
  lines.push(`# ${c.title}`);
  lines.push("");
  lines.push(`_Helm Sandbox · ${new Date(c.createdAt).toISOString()} · ${c.providerId} · ${c.model}_`);
  lines.push("");
  if (c.system?.trim()) {
    lines.push("## System");
    lines.push("");
    lines.push("```");
    lines.push(c.system.trim());
    lines.push("```");
    lines.push("");
  }
  if (c.tools.length) {
    lines.push(`_Active tools: ${c.tools.join(", ")}_`);
    lines.push("");
  }
  for (const m of c.messages) {
    if (m.role === "system") continue;
    const role = m.role === "assistant" ? "Assistant" : m.role === "tool" ? "Tool" : "You";
    lines.push(`### ${role}`);
    lines.push("");
    if (typeof m.content === "string") {
      lines.push(m.content);
    } else {
      for (const block of m.content) {
        if (block.type === "text") lines.push(block.text);
        else if (block.type === "tool_use") {
          lines.push(`\`\`\`json`);
          lines.push(`// tool call → ${block.name}`);
          lines.push(JSON.stringify(block.input, null, 2));
          lines.push("```");
        } else if (block.type === "tool_result") {
          lines.push(`\`\`\``);
          lines.push(`// tool result`);
          lines.push(block.content);
          lines.push("```");
        }
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}
