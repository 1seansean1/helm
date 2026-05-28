import { useState } from "react";
import { Eye, EyeOff, KeySquare, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { useHelm } from "../state";
import { MODELS, type ModelId } from "../lib/models";
import { callClaude, AnthropicError } from "../lib/anthropic";

function OpenRouterKeyForm() {
  const { state, setOpenRouterKey, forgetOpenRouterKey } = useHelm();
  const [draft, setDraft] = useState(state.openRouterKey);
  const [reveal, setReveal] = useState(false);
  return (
    <>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={reveal ? "text" : "password"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="sk-or-..."
            className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 font-mono text-sm text-ink-100 focus:border-gold-400"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute inset-y-0 right-2 my-1 rounded-md p-1 text-ink-300 hover:bg-ink-800"
            aria-label={reveal ? "Hide key" : "Show key"}
          >
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <button
          onClick={() => setOpenRouterKey(draft)}
          className="rounded-md bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-300"
        >
          Save
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => {
            forgetOpenRouterKey();
            setDraft("");
          }}
          className="inline-flex items-center gap-2 rounded-full border border-rust-500/40 px-3 py-1.5 text-xs text-rust-400 hover:bg-rust-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" /> Forget key
        </button>
      </div>
    </>
  );
}

export function SettingsPage() {
  const {
    state,
    setApiKey,
    forgetApiKey,
    setDefaultModel,
    setDefaultTemperature,
    setDefaultMaxTokens,
    resetAll,
  } = useHelm();
  const [keyDraft, setKeyDraft] = useState(state.apiKey);
  const [reveal, setReveal] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  async function testKey() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await callClaude({
        apiKey: keyDraft.trim(),
        model: "claude-haiku-4-5-20251001",
        system: "Reply with exactly 'ok'.",
        messages: [{ role: "user", content: "Reply with exactly the word: ok" }],
        max_tokens: 16,
        temperature: 0,
      });
      setTestResult(
        res.text.toLowerCase().includes("ok")
          ? "Key works — Claude replied as expected."
          : `Got an unexpected response: ${res.text.slice(0, 60)}`,
      );
    } catch (e) {
      const msg = e instanceof AnthropicError ? e.message : e instanceof Error ? e.message : String(e);
      setTestResult(`Failed: ${msg}`);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 pt-8 pb-16 md:pt-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-50">Settings</h1>
      <p className="mt-2 text-ink-300">
        Your API key lives only in this browser. It is sent only to <code>api.anthropic.com</code>{" "}
        on requests you initiate.
      </p>

      <section className="card mt-8 p-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-50">
          <KeySquare className="h-4 w-4 text-gold-300" />
          Anthropic API key
        </div>
        <p className="mb-3 text-xs text-ink-300">
          Get one from{" "}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
            className="text-gold-300 underline"
          >
            console.anthropic.com
          </a>
          . Starts with <code>sk-ant-</code>.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={reveal ? "text" : "password"}
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 font-mono text-sm text-ink-100 focus:border-gold-400"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              className="absolute inset-y-0 right-2 my-1 rounded-md p-1 text-ink-300 hover:bg-ink-800"
              aria-label={reveal ? "Hide key" : "Show key"}
            >
              {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            onClick={() => setApiKey(keyDraft)}
            className="rounded-md bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-300"
          >
            Save
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={testKey}
            disabled={testing || !keyDraft.trim()}
            className="inline-flex items-center gap-2 rounded-full border border-ink-600 px-3 py-1.5 text-xs hover:border-gold-400 hover:text-gold-300 disabled:opacity-50"
          >
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            Test key
          </button>
          <button
            onClick={() => {
              forgetApiKey();
              setKeyDraft("");
              setTestResult(null);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-rust-500/40 px-3 py-1.5 text-xs text-rust-400 hover:bg-rust-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Forget key
          </button>
        </div>
        {testResult && (
          <p
            className={`mt-3 text-xs ${
              testResult.startsWith("Key works")
                ? "text-moss-400"
                : testResult.startsWith("Failed")
                  ? "text-rust-400"
                  : "text-ink-200"
            }`}
          >
            {testResult}
          </p>
        )}
      </section>

      <section className="card mt-6 p-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-50">
          <KeySquare className="h-4 w-4 text-gold-300" />
          OpenRouter API key (optional)
        </div>
        <p className="mb-3 text-xs text-ink-300">
          One key unlocks ~100 models across providers (GPT-5, Gemini, Llama, Mistral, DeepSeek, Grok, Claude) inside <strong>Sandbox</strong>. Get one at{" "}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="text-gold-300 underline"
          >
            openrouter.ai/keys
          </a>
          . Starts with <code>sk-or-</code>.
        </p>
        <OpenRouterKeyForm />
      </section>

      <section className="card mt-6 p-5">
        <div className="mb-3 text-sm font-semibold text-ink-50">Defaults for exercises</div>
        <label className="mb-3 block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Default model
          </span>
          <select
            value={state.defaultModel}
            onChange={(e) => setDefaultModel(e.target.value as ModelId)}
            className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-gold-400"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — {m.blurb}
              </option>
            ))}
          </select>
        </label>
        <label className="mb-3 block">
          <span className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink-300">
            <span>Default temperature</span>
            <span className="font-mono text-gold-300">{state.defaultTemperature.toFixed(1)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={state.defaultTemperature}
            onChange={(e) => setDefaultTemperature(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Default max tokens
          </span>
          <select
            value={state.defaultMaxTokens}
            onChange={(e) => setDefaultMaxTokens(Number(e.target.value))}
            className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-gold-400"
          >
            {[256, 512, 1024, 2048, 4096].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="card mt-6 p-5">
        <div className="mb-2 text-sm font-semibold text-ink-50">Danger zone</div>
        <p className="text-xs text-ink-300">
          Erases everything in this browser — key, notes, exercise history, and settings.
        </p>
        <button
          onClick={() => {
            if (confirm("Erase EVERYTHING (key + notes + history)? This cannot be undone.")) {
              resetAll();
              setKeyDraft("");
              setTestResult(null);
            }
          }}
          className="mt-3 rounded-full border border-rust-500/40 px-4 py-2 text-xs font-medium text-rust-400 hover:bg-rust-500/10"
        >
          Erase all local data
        </button>
      </section>
    </div>
  );
}
