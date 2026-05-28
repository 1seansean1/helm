import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CircleStop,
  Coins,
  Copy,
  Download,
  KeySquare,
  Menu,
  MessageSquare,
  MessageSquarePlus,
  PanelRightOpen,
  Plus,
  Send,
  Settings as SettingsIcon,
  Sparkles,
  StopCircle,
  Trash2,
  Wand2,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useHelm } from "../state";
import {
  buildEmptyConversation,
  exportMarkdown,
  newId,
  useConversations,
  type SandboxConversation,
} from "../sandbox-state";
import { PROVIDERS, providerById, type ChatMessage, type ContentBlock } from "../lib/providers";
import { SANDBOX_TOOLS, TOOLS_BY_NAME, toolDefs } from "../lib/sandbox-tools";
import { formatCostUSD, priceOf, PRICING } from "../lib/pricing";
import { POCKET, type PocketCard } from "../pocket";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function blocksText(content: string | ContentBlock[]): string {
  if (typeof content === "string") return content;
  return content
    .map((b) => (b.type === "text" ? b.text : b.type === "tool_use" ? `[tool:${b.name}]` : `[tool-result]`))
    .join("");
}

function totalUsage(conv: SandboxConversation | null) {
  if (!conv) return { input: 0, output: 0, cost: 0 };
  let input = 0, output = 0, cost = 0;
  for (const m of conv.messages) {
    const u = (m as ChatMessage & { _usage?: { input_tokens: number; output_tokens: number } })._usage;
    if (u) {
      input += u.input_tokens;
      output += u.output_tokens;
      const c = priceOf(conv.model, u);
      if (c != null) cost += c;
    }
  }
  return { input, output, cost };
}

// ─────────────────────────────────────────────────────────────────────────────
// SandboxPage
// ─────────────────────────────────────────────────────────────────────────────

export function SandboxPage() {
  const { state, setSandboxDefaults } = useHelm();
  const convs = useConversations();
  const nav = useNavigate();
  const loc = useLocation();

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [pocketPicker, setPocketPicker] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [composerText, setComposerText] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // ── Init: ensure there's an active conversation
  useEffect(() => {
    if (convs.state.conversations.length === 0) {
      const c = buildEmptyConversation({
        providerId: state.sandboxDefaults.providerId,
        model:
          state.sandboxDefaults.providerId === "anthropic"
            ? state.sandboxDefaults.anthropicModel
            : state.sandboxDefaults.openRouterModel,
        system: "",
        title: "First chat",
        temperature: state.sandboxDefaults.temperature,
        max_tokens: state.sandboxDefaults.max_tokens,
        tools: ["get_transaction", "get_customer_history"],
      });
      convs.upsert(c);
      convs.setActive(c.id);
    } else if (!convs.state.activeId) {
      convs.setActive(convs.state.conversations[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Pocket → Sandbox handoff via querystring (?prefill=<card-id>)
  useEffect(() => {
    // Hash-router puts search params after the hash route, e.g. #/sandbox?prefill=abc
    const hash = window.location.hash;
    const q = hash.includes("?") ? new URLSearchParams(hash.split("?")[1]) : null;
    const prefillId = q?.get("prefill");
    if (!prefillId) return;
    const card = POCKET.find((c) => c.id === prefillId);
    if (!card) return;
    // Create a fresh conversation seeded with the artifact as system prompt
    const c = buildEmptyConversation({
      providerId: state.sandboxDefaults.providerId,
      model:
        state.sandboxDefaults.providerId === "anthropic"
          ? state.sandboxDefaults.anthropicModel
          : state.sandboxDefaults.openRouterModel,
      system: card.body,
      title: card.title,
      temperature: state.sandboxDefaults.temperature,
      max_tokens: state.sandboxDefaults.max_tokens,
      tools: [],
    });
    convs.upsert(c);
    convs.setActive(c.id);
    // Strip the query so a refresh doesn't re-seed
    nav("/sandbox", { replace: true });
    setRightOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.key]);

  const active = convs.get(convs.state.activeId);

  // Auto-scroll on new content
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, running]);

  const provider = active ? providerById(active.providerId)! : null;
  const apiKey = useMemo(() => {
    if (!active) return "";
    return active.providerId === "anthropic" ? state.apiKey : state.openRouterKey;
  }, [active, state.apiKey, state.openRouterKey]);

  const usage = useMemo(() => totalUsage(active), [active]);

  // ── New conversation
  function newConversation(seed?: { system?: string; title?: string; tools?: string[] }) {
    const c = buildEmptyConversation({
      providerId: state.sandboxDefaults.providerId,
      model:
        state.sandboxDefaults.providerId === "anthropic"
          ? state.sandboxDefaults.anthropicModel
          : state.sandboxDefaults.openRouterModel,
      system: seed?.system ?? "",
      title: seed?.title ?? "New conversation",
      temperature: state.sandboxDefaults.temperature,
      max_tokens: state.sandboxDefaults.max_tokens,
      tools: seed?.tools ?? [],
    });
    convs.upsert(c);
    convs.setActive(c.id);
    setLeftOpen(false);
    setComposerText("");
    setError(null);
  }

  // ── Send / tool-use loop
  async function send() {
    if (!active || running) return;
    const text = composerText.trim();
    if (!text) return;
    if (!apiKey) {
      setError(
        active.providerId === "anthropic"
          ? "Add an Anthropic API key in Settings to chat with Claude."
          : "Add an OpenRouter API key in Settings to chat with these models.",
      );
      return;
    }

    setError(null);

    const userMsg: ChatMessage = { id: newId(), role: "user", content: text, ts: Date.now() };
    convs.appendMessage(active.id, userMsg);
    setComposerText("");
    // First-message title auto-name
    if (active.messages.length === 0 && active.title === "New conversation") {
      convs.rename(active.id, text.slice(0, 48));
    }

    await runTurnLoop({
      ...active,
      messages: [...active.messages, userMsg],
    });
  }

  async function runTurnLoop(seed: SandboxConversation) {
    if (!provider) return;
    setRunning(true);
    const ac = new AbortController();
    abortRef.current = ac;

    let workingConv = seed;
    let safety = 0;
    try {
      while (safety++ < 8) {
        const assistantId = newId();
        // Insert an empty assistant message placeholder we'll grow
        const placeholder: ChatMessage = {
          id: assistantId,
          role: "assistant",
          content: typeof workingConv.messages[workingConv.messages.length - 1]?.content === "string"
            ? "" // placeholder string, will be set to blocks if tool_use occurs
            : "",
          ts: Date.now(),
        };
        convs.appendMessage(workingConv.id, placeholder);
        workingConv = { ...workingConv, messages: [...workingConv.messages, placeholder] };

        let accText = "";
        const accBlocks: ContentBlock[] = [];
        let usingTools = false;
        let stop: string | null = null;
        let usage: { input_tokens: number; output_tokens: number } | null = null;

        const tools = provider.supportsTools && workingConv.tools.length
          ? toolDefs(workingConv.tools)
          : undefined;

        for await (const evt of provider.streamChat(
          {
            apiKey,
            model: workingConv.model,
            system: workingConv.system,
            messages: workingConv.messages.filter((m) => m.id !== assistantId),
            max_tokens: workingConv.params.max_tokens,
            temperature: workingConv.params.temperature,
            tools,
          },
          ac.signal,
        )) {
          if (ac.signal.aborted) break;
          if (evt.type === "text_delta") {
            accText += evt.text;
            convs.updateMessage(workingConv.id, assistantId, (m) => {
              if (typeof m.content === "string") return { ...m, content: accText };
              // If we already added tool_use blocks, append/update the trailing text block
              const last = m.content[m.content.length - 1];
              if (last && last.type === "text") {
                return {
                  ...m,
                  content: [...m.content.slice(0, -1), { type: "text", text: (last.text ?? "") + evt.text }],
                };
              }
              return { ...m, content: [...m.content, { type: "text", text: evt.text }] };
            });
          } else if (evt.type === "tool_use_start") {
            usingTools = true;
            // Flush any text we've gathered into a text block first
            if (accText && accBlocks.length === 0) {
              accBlocks.push({ type: "text", text: accText });
            }
            accBlocks.push({ type: "tool_use", id: evt.id, name: evt.name, input: {} });
            convs.updateMessage(workingConv.id, assistantId, (m) => ({ ...m, content: [...accBlocks] }));
          } else if (evt.type === "tool_use_done") {
            const idx = accBlocks.findIndex((b) => b.type === "tool_use" && b.id === evt.id);
            if (idx >= 0) {
              (accBlocks[idx] as any).input = evt.input;
              convs.updateMessage(workingConv.id, assistantId, (m) => ({ ...m, content: [...accBlocks] }));
            }
          } else if (evt.type === "stop_reason") {
            stop = evt.reason;
          } else if (evt.type === "usage") {
            usage = { input_tokens: evt.input_tokens, output_tokens: evt.output_tokens };
          } else if (evt.type === "error") {
            setError(evt.message);
            convs.updateMessage(workingConv.id, assistantId, (m) => ({
              ...m,
              content: (typeof m.content === "string" ? m.content : blocksText(m.content)) +
                       (accText ? "" : "[stream error]"),
            }));
            setRunning(false);
            return;
          }
        }

        // Stamp usage onto the assistant message
        if (usage) {
          convs.updateMessage(workingConv.id, assistantId, (m) => ({
            ...m,
            ...({ _usage: usage } as object),
          }));
        }

        if (!usingTools || stop !== "tool_use") {
          break;
        }

        // Execute the tool_use blocks, append a user message of tool_result blocks
        const toolResults: ContentBlock[] = [];
        for (const block of accBlocks) {
          if (block.type !== "tool_use") continue;
          const tool = TOOLS_BY_NAME[block.name];
          let result = "";
          let isErr = false;
          if (!tool) {
            result = JSON.stringify({ error: `Unknown tool: ${block.name}` });
            isErr = true;
          } else {
            try {
              result = await tool.execute(block.input ?? {});
            } catch (e) {
              result = JSON.stringify({ error: e instanceof Error ? e.message : String(e) });
              isErr = true;
            }
          }
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: result,
            is_error: isErr,
          });
        }

        const toolMsg: ChatMessage = {
          id: newId(),
          role: "user",
          content: toolResults,
          ts: Date.now(),
        };
        convs.appendMessage(workingConv.id, toolMsg);
        workingConv = {
          ...workingConv,
          messages: [...workingConv.messages, toolMsg],
        };
      }
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function downloadMarkdown() {
    if (!active) return;
    const md = exportMarkdown(active);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `helm-sandbox-${(active.title || "chat").slice(0, 32).replace(/\s+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full md:h-[calc(100vh-3.5rem)]">
      {/* Conversations sidebar */}
      <ConversationsSidebar
        open={leftOpen}
        onClose={() => setLeftOpen(false)}
        conversations={convs.state.conversations}
        activeId={convs.state.activeId}
        onSelect={(id) => {
          convs.setActive(id);
          setLeftOpen(false);
        }}
        onNew={() => newConversation()}
        onDelete={(id) => convs.remove(id)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center gap-2 border-b border-ink-700/60 bg-ink-950/85 px-3 py-2 backdrop-blur-md">
          <button
            onClick={() => setLeftOpen(true)}
            className="rounded-md p-2 text-ink-300 hover:bg-ink-800 md:hidden"
            aria-label="Conversations"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Zap className="h-4 w-4 shrink-0 text-gold-300" />
            <div className="min-w-0 truncate font-display text-sm font-semibold text-ink-50">
              {active?.title ?? "Sandbox"}
            </div>
          </div>

          {active && (
            <ProviderModelPicker
              providerId={active.providerId}
              model={active.model}
              onChange={(providerId, model) => {
                convs.updateConfig(active.id, { providerId, model });
                setSandboxDefaults({ providerId });
                if (providerId === "anthropic") setSandboxDefaults({ anthropicModel: model });
                else setSandboxDefaults({ openRouterModel: model });
              }}
            />
          )}

          <CostMeter
            model={active?.model ?? ""}
            input={usage.input}
            output={usage.output}
            cost={usage.cost}
          />

          <button
            onClick={() => newConversation()}
            className="hidden items-center gap-1 rounded-full bg-gold-400 px-3 py-1.5 text-xs font-semibold text-ink-950 hover:bg-gold-300 sm:inline-flex"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
          <button
            onClick={() => setRightOpen(true)}
            className="rounded-md p-2 text-ink-300 hover:bg-ink-800"
            aria-label="Context panel"
            title="Context · tools · params"
          >
            <PanelRightOpen className="h-5 w-5" />
          </button>
        </header>

        {/* Banner if no key */}
        {active && !apiKey && (
          <Link
            to="/settings"
            className="border-b border-gold-500/30 bg-gold-500/[0.07] px-4 py-2 text-xs text-gold-200 hover:bg-gold-500/[0.12]"
          >
            <KeySquare className="mr-1 inline h-3.5 w-3.5" />
            No {provider?.label} key configured — add one in Settings to send messages.
          </Link>
        )}

        {/* Error */}
        {error && (
          <div className="border-b border-rust-500/40 bg-rust-500/10 px-4 py-2 text-xs text-rust-400">
            {error}
          </div>
        )}

        {/* Messages */}
        <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6">
          {active && active.messages.length === 0 && (
            <EmptyState
              onPickPocket={() => setPocketPicker(true)}
              hasSystem={!!active.system.trim()}
            />
          )}
          <ul className="mx-auto max-w-3xl space-y-3">
            {active?.messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
            {running && (
              <li className="text-xs text-ink-300">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3 animate-pulse text-gold-300" />
                  thinking…
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Composer */}
        <Composer
          value={composerText}
          onChange={setComposerText}
          onSend={send}
          onStop={stop}
          onPickPocket={() => setPocketPicker(true)}
          onDownload={downloadMarkdown}
          running={running}
          disabled={!active}
        />
      </div>

      {/* Right Context Panel */}
      {active && (
        <ContextPanel
          open={rightOpen}
          onClose={() => setRightOpen(false)}
          conv={active}
          onUpdate={(patch) => convs.updateConfig(active.id, patch)}
          onPickPocket={() => {
            setRightOpen(false);
            setPocketPicker(true);
          }}
        />
      )}

      {/* Pocket picker overlay */}
      {pocketPicker && active && (
        <PocketPicker
          onClose={() => setPocketPicker(false)}
          onApplyAsSystem={(card) => {
            convs.updateConfig(active.id, { system: card.body });
            convs.rename(active.id, card.title);
            setPocketPicker(false);
          }}
          onApplyAsMessage={(card) => {
            setComposerText((t) => (t ? `${t}\n\n${card.body}` : card.body));
            setPocketPicker(false);
          }}
          onNewFromPocket={(card) => {
            newConversation({ system: card.body, title: card.title });
            setPocketPicker(false);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ConversationsSidebar
// ─────────────────────────────────────────────────────────────────────────────

function ConversationsSidebar({
  open,
  onClose,
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  conversations: SandboxConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const list = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-700/60 bg-ink-900/40 md:flex">
        <SidebarInner list={list} activeId={activeId} onSelect={onSelect} onNew={onNew} onDelete={onDelete} />
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm md:hidden" onClick={onClose}>
          <aside
            className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-ink-700/60 bg-ink-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-ink-700/60">
              <span className="font-display text-sm">Conversations</span>
              <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 hover:bg-ink-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarInner list={list} activeId={activeId} onSelect={onSelect} onNew={onNew} onDelete={onDelete} />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarInner({
  list,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  list: SandboxConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-ink-700/60 p-2">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-full bg-gold-400 px-3 py-2 text-xs font-semibold text-ink-950 hover:bg-gold-300"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" /> New conversation
        </button>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {list.length === 0 && <p className="px-2 text-xs text-ink-300">No conversations yet.</p>}
        {list.map((c) => {
          const active = c.id === activeId;
          return (
            <li key={c.id} className="group relative">
              <button
                onClick={() => onSelect(c.id)}
                className={`mb-1 flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-xs transition ${
                  active ? "bg-gold-500/12 text-gold-200" : "text-ink-200 hover:bg-ink-800"
                }`}
              >
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70" />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{c.title}</div>
                  <div className="text-[10px] text-ink-400">
                    {c.messages.filter((m) => m.role !== "system").length} msg ·{" "}
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${c.title}"?`)) onDelete(c.id);
                }}
                aria-label="Delete"
                className="absolute right-1 top-1.5 rounded p-1 text-ink-400 opacity-0 transition group-hover:opacity-100 hover:bg-ink-800 hover:text-rust-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ContextPanel
// ─────────────────────────────────────────────────────────────────────────────

function ContextPanel({
  open,
  onClose,
  conv,
  onUpdate,
  onPickPocket,
}: {
  open: boolean;
  onClose: () => void;
  conv: SandboxConversation;
  onUpdate: (patch: Partial<Pick<SandboxConversation, "system" | "params" | "tools" | "model" | "providerId">>) => void;
  onPickPocket: () => void;
}) {
  const provider = providerById(conv.providerId)!;
  return (
    <>
      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm md:hidden" onClick={onClose}>
          <aside
            className="absolute right-0 top-0 flex h-full w-80 max-w-[90vw] flex-col border-l border-ink-700/60 bg-ink-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ink-700/60 px-3 py-2">
              <span className="font-display text-sm">Context · tools · params</span>
              <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 hover:bg-ink-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ContextPanelInner conv={conv} onUpdate={onUpdate} onPickPocket={onPickPocket} provider={provider} />
          </aside>
        </div>
      )}
      {/* Desktop side panel */}
      <aside
        className={`hidden border-l border-ink-700/60 bg-ink-900/40 transition-all md:flex ${open ? "w-80" : "w-0"} flex-col overflow-hidden`}
      >
        {open && (
          <>
            <div className="flex items-center justify-between border-b border-ink-700/60 px-3 py-2">
              <span className="font-display text-sm">Context · tools · params</span>
              <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 hover:bg-ink-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ContextPanelInner conv={conv} onUpdate={onUpdate} onPickPocket={onPickPocket} provider={provider} />
          </>
        )}
      </aside>
    </>
  );
}

function ContextPanelInner({
  conv,
  onUpdate,
  onPickPocket,
  provider,
}: {
  conv: SandboxConversation;
  onUpdate: (patch: Partial<Pick<SandboxConversation, "system" | "params" | "tools" | "model" | "providerId">>) => void;
  onPickPocket: () => void;
  provider: ReturnType<typeof providerById> extends infer T ? Exclude<T, undefined> : never;
}) {
  return (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 text-sm">
      <section>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-ink-300">System prompt</h3>
          <button
            onClick={onPickPocket}
            className="inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-semibold text-gold-300 hover:bg-gold-500/25"
          >
            <Wand2 className="h-3 w-3" /> From Pocket
          </button>
        </div>
        <textarea
          value={conv.system}
          onChange={(e) => onUpdate({ system: e.target.value })}
          rows={9}
          placeholder="You are a senior product manager at a US national bank..."
          className="w-full rounded-md border border-ink-700 bg-ink-900/60 p-2.5 font-mono text-[12px] leading-relaxed text-ink-100 focus:border-gold-400"
        />
      </section>

      <section>
        <h3 className="mb-1 text-[10px] uppercase tracking-[0.2em] text-ink-300">Sampling</h3>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink-300">
              <span>Temperature</span>
              <span className="font-mono text-gold-300">{conv.params.temperature.toFixed(1)}</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={conv.params.temperature}
              onChange={(e) =>
                onUpdate({ params: { ...conv.params, temperature: Number(e.target.value) } })
              }
              className="w-full"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-ink-300">
              Max tokens
            </span>
            <select
              value={conv.params.max_tokens}
              onChange={(e) =>
                onUpdate({ params: { ...conv.params, max_tokens: Number(e.target.value) } })
              }
              className="w-full rounded-md border border-ink-700 bg-ink-900 px-2.5 py-1.5 text-xs text-ink-100 focus:border-gold-400"
            >
              {[256, 512, 1024, 2048, 4096, 8192].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {provider.supportsTools && (
        <section>
          <div className="mb-1 flex items-center gap-1.5">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-ink-300">Mock tools</h3>
            <Wrench className="h-3 w-3 text-gold-300" />
          </div>
          <p className="mb-2 text-[11px] text-ink-300">
            Toggle on a tool; the model can call it; the harness executes a fake
            banking-flavoured response and feeds it back. Disputes demo built-in.
          </p>
          <ul className="space-y-1.5">
            {SANDBOX_TOOLS.map((t) => {
              const active = conv.tools.includes(t.def.name);
              return (
                <li key={t.def.name} className="rounded-md border border-ink-700/60 bg-ink-900/40 p-2">
                  <label className="flex items-start gap-2 text-[12px] text-ink-100">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) =>
                        onUpdate({
                          tools: e.target.checked
                            ? [...conv.tools, t.def.name]
                            : conv.tools.filter((n) => n !== t.def.name),
                        })
                      }
                      className="mt-1 h-3.5 w-3.5"
                    />
                    <div>
                      <div className="font-mono text-[11.5px] text-gold-300">{t.def.name}</div>
                      <div className="text-[11px] text-ink-300">{t.def.description}</div>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-1 text-[10px] uppercase tracking-[0.2em] text-ink-300">Conversation</h3>
        <div className="space-y-2">
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-ink-300">Title</span>
            <input
              value={conv.title}
              onChange={(e) => onUpdate({ /* allow rename via updateConfig path */ } as any)}
              readOnly
              className="w-full rounded-md border border-ink-700 bg-ink-900/40 px-2.5 py-1.5 text-xs text-ink-300"
            />
          </label>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProviderModelPicker
// ─────────────────────────────────────────────────────────────────────────────

function ProviderModelPicker({
  providerId,
  model,
  onChange,
}: {
  providerId: "anthropic" | "openrouter";
  model: string;
  onChange: (providerId: "anthropic" | "openrouter", model: string) => void;
}) {
  const provider = providerById(providerId)!;
  return (
    <div className="hidden gap-1 sm:flex">
      <select
        value={providerId}
        onChange={(e) => {
          const nid = e.target.value as "anthropic" | "openrouter";
          const np = providerById(nid)!;
          onChange(nid, np.curatedModels[0].id);
        }}
        className="rounded-md border border-ink-700 bg-ink-900 px-2 py-1 text-[11px] text-ink-100 focus:border-gold-400"
      >
        {PROVIDERS.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>
      <select
        value={model}
        onChange={(e) => onChange(providerId, e.target.value)}
        className="rounded-md border border-ink-700 bg-ink-900 px-2 py-1 text-[11px] text-ink-100 focus:border-gold-400"
      >
        {provider.curatedModels.map((m) => (
          <option key={m.id} value={m.id}>{m.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CostMeter
// ─────────────────────────────────────────────────────────────────────────────

function CostMeter({
  model,
  input,
  output,
  cost,
}: {
  model: string;
  input: number;
  output: number;
  cost: number;
}) {
  const price = PRICING[model];
  const tip = price
    ? `${model}: $${price.input_per_mtok}/Mt in · $${price.output_per_mtok}/Mt out`
    : `${model || "—"}: pricing unknown`;
  return (
    <div
      title={tip}
      className="hidden items-center gap-1 rounded-full border border-ink-700 px-2 py-1 text-[10px] text-ink-300 sm:inline-flex"
    >
      <Coins className="h-3 w-3 text-gold-300" />
      <span className="font-mono">{input}/{output}</span>
      <span className="font-mono text-gold-300">{formatCostUSD(cost || 0)}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MessageBubble
// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user" && (typeof msg.content === "string" || !msg.content.some((b) => b.type === "tool_result"));
  const isToolReply = msg.role === "user" && Array.isArray(msg.content) && msg.content.some((b) => b.type === "tool_result");
  const isAssistant = msg.role === "assistant";

  if (isToolReply) {
    return (
      <li className="ml-3 space-y-1">
        {(msg.content as ContentBlock[]).map((b, i) =>
          b.type === "tool_result" ? <ToolResultBlock key={i} block={b} /> : null,
        )}
      </li>
    );
  }

  return (
    <li className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed shadow-soft ${
          isUser
            ? "bg-gold-500/15 text-ink-50 ring-1 ring-gold-500/30"
            : "bg-ink-800/70 text-ink-100 ring-1 ring-ink-700/60"
        }`}
      >
        {typeof msg.content === "string" ? (
          msg.content === "" && isAssistant ? (
            <span className="inline-block animate-pulse text-gold-300">▍</span>
          ) : (
            <pre className="whitespace-pre-wrap break-words font-sans">{msg.content}</pre>
          )
        ) : (
          <div className="space-y-2">
            {msg.content.map((b, i) =>
              b.type === "text" ? (
                <pre key={i} className="whitespace-pre-wrap break-words font-sans">
                  {b.text}
                </pre>
              ) : b.type === "tool_use" ? (
                <ToolUseBlock key={i} block={b} />
              ) : null,
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function ToolUseBlock({ block }: { block: Extract<ContentBlock, { type: "tool_use" }> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-gold-500/30 bg-gold-500/[0.06] p-2 text-[12px]">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-1.5 text-left">
        <Wrench className="h-3 w-3 text-gold-300" />
        <span className="font-mono text-gold-300">{block.name}</span>
        <span className="text-ink-300">·</span>
        <span className="truncate text-ink-300">
          {JSON.stringify(block.input)}
        </span>
        <span className="ml-auto text-[10px] text-ink-400">{open ? "hide" : "show"}</span>
      </button>
      {open && (
        <pre className="mt-1.5 overflow-auto rounded-sm bg-ink-950/60 p-2 font-mono text-[11px] text-ink-200">
          {JSON.stringify(block.input, null, 2)}
        </pre>
      )}
    </div>
  );
}

function ToolResultBlock({ block }: { block: Extract<ContentBlock, { type: "tool_result" }> }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-md border p-2 text-[12px] ${
        block.is_error
          ? "border-rust-500/40 bg-rust-500/[0.08]"
          : "border-moss-500/30 bg-moss-500/[0.07]"
      }`}
    >
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-1.5 text-left">
        <Wrench className={`h-3 w-3 ${block.is_error ? "text-rust-400" : "text-moss-400"}`} />
        <span className={`font-mono ${block.is_error ? "text-rust-400" : "text-moss-400"}`}>
          tool result
        </span>
        <span className="ml-auto text-[10px] text-ink-400">{open ? "hide" : "show"}</span>
      </button>
      {open && (
        <pre className="mt-1.5 overflow-auto rounded-sm bg-ink-950/60 p-2 font-mono text-[11px] text-ink-200">
          {block.content}
        </pre>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composer
// ─────────────────────────────────────────────────────────────────────────────

function Composer({
  value,
  onChange,
  onSend,
  onStop,
  onPickPocket,
  onDownload,
  running,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  onPickPocket: () => void;
  onDownload: () => void;
  running: boolean;
  disabled: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  return (
    <div className="border-t border-ink-700/60 bg-ink-950/85 px-3 py-2.5 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <button
          onClick={onPickPocket}
          aria-label="Insert from Pocket"
          title="Insert from Pocket"
          className="rounded-full border border-ink-700 p-2 text-ink-300 hover:border-gold-400 hover:text-gold-300"
        >
          <Wand2 className="h-4 w-4" />
        </button>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={disabled ? "Loading…" : "Ask anything · ⌘/Ctrl-Enter to send"}
          rows={1}
          className="min-h-[42px] flex-1 resize-none rounded-2xl border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-400 focus:border-gold-400"
        />
        <button
          onClick={onDownload}
          aria-label="Download conversation"
          title="Download as Markdown"
          className="rounded-full border border-ink-700 p-2 text-ink-300 hover:border-gold-400 hover:text-gold-300"
        >
          <Download className="h-4 w-4" />
        </button>
        {running ? (
          <button
            onClick={onStop}
            className="inline-flex items-center gap-1 rounded-full bg-rust-500 px-4 py-2 text-sm font-semibold text-ink-50 hover:bg-rust-600"
          >
            <StopCircle className="h-4 w-4" /> Stop
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className="inline-flex items-center gap-1 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-300 disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> Send
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({
  onPickPocket,
  hasSystem,
}: {
  onPickPocket: () => void;
  hasSystem: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl py-8 text-center">
      <Sparkles className="mx-auto h-8 w-8 text-gold-300" />
      <h2 className="mt-2 font-display text-2xl text-ink-50">A live harness, in your pocket.</h2>
      <p className="mt-2 text-sm text-ink-300">
        Chat with Claude or any OpenRouter model. Wrap the call in a system prompt drawn
        from your <em>Pocket</em>. Toggle on banking-themed tools and watch the model use
        them — the literal demo of module&nbsp;3.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button
          onClick={onPickPocket}
          className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-300"
        >
          <Wand2 className="h-4 w-4" /> Load a Pocket template
        </button>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 rounded-full border border-ink-600 px-4 py-2 text-sm text-ink-100 hover:border-gold-400 hover:text-gold-300"
        >
          <SettingsIcon className="h-4 w-4" /> Add an API key
        </Link>
      </div>
      {hasSystem && (
        <p className="mt-4 text-[12px] text-moss-400">
          System prompt active — open <span className="font-semibold">Context</span> on the right to view.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PocketPicker overlay
// ─────────────────────────────────────────────────────────────────────────────

function PocketPicker({
  onClose,
  onApplyAsSystem,
  onApplyAsMessage,
  onNewFromPocket,
}: {
  onClose: () => void;
  onApplyAsSystem: (card: PocketCard) => void;
  onApplyAsMessage: (card: PocketCard) => void;
  onNewFromPocket: (card: PocketCard) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = POCKET.filter(
    (c) =>
      !q ||
      c.title.toLowerCase().includes(q.toLowerCase()) ||
      c.useWhen.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink-950/70 backdrop-blur-sm sm:items-center sm:justify-center" onClick={onClose}>
      <div
        className="flex h-[85vh] w-full flex-col rounded-t-2xl border border-ink-700 bg-ink-900 sm:h-[80vh] sm:max-w-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-700/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-gold-300" />
            <span className="font-display text-sm">Insert from Pocket</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 hover:bg-ink-800">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="border-b border-ink-700/60 px-4 py-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search — 'harness', 'policy', 'asked about pricing'…"
            className="w-full rounded-full border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-400 focus:border-gold-400"
            autoFocus
          />
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto p-3">
          {filtered.map((c) => (
            <li key={c.id} className="card mb-2 p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-300">{c.category}</div>
              <h3 className="font-display text-[14px] font-semibold text-ink-50">{c.title}</h3>
              <p className="mt-1 text-[12px] text-ink-300">
                <span className="font-semibold text-gold-300">When </span>{c.useWhen}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => onApplyAsSystem(c)}
                  className="inline-flex items-center gap-1 rounded-full bg-gold-400 px-3 py-1 text-[11px] font-semibold text-ink-950 hover:bg-gold-300"
                  title="Replace the system prompt for this conversation"
                >
                  <ArrowRight className="h-3 w-3" /> Use as system
                </button>
                <button
                  onClick={() => onNewFromPocket(c)}
                  className="inline-flex items-center gap-1 rounded-full border border-ink-600 px-3 py-1 text-[11px] hover:border-gold-400 hover:text-gold-300"
                  title="Open a NEW conversation with this as the system prompt"
                >
                  <MessageSquarePlus className="h-3 w-3" /> New chat
                </button>
                <button
                  onClick={() => onApplyAsMessage(c)}
                  className="inline-flex items-center gap-1 rounded-full border border-ink-700 px-3 py-1 text-[11px] text-ink-200 hover:border-gold-400"
                  title="Paste body into the composer"
                >
                  <Copy className="h-3 w-3" /> Insert in composer
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-ink-300">
              Nothing matches that. Try another phrase.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}

// Suppress unused-import noise for icons that are referenced conditionally
void CircleStop;
