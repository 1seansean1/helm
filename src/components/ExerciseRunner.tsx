import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Loader2, Play, RotateCcw, Sparkles, TestTube2 } from "lucide-react";
import type { Exercise } from "../curriculum";
import { useHelm } from "../state";
import { MODELS, type ModelId } from "../lib/models";
import { AnthropicError, callClaude } from "../lib/anthropic";

interface Props {
  moduleId: string;
  exercise: Exercise;
}

export function ExerciseRunner({ moduleId, exercise }: Props) {
  const { state, recordExerciseRun } = useHelm();
  const [system, setSystem] = useState(exercise.default_system);
  const [user, setUser] = useState(exercise.default_user);
  const [model, setModel] = useState<ModelId>(
    exercise.suggested_model ?? state.defaultModel,
  );
  const [temperature, setTemperature] = useState<number>(
    exercise.suggested_temperature ?? state.defaultTemperature,
  );
  const [maxTokens, setMaxTokens] = useState<number>(
    exercise.suggested_max_tokens ?? state.defaultMaxTokens,
  );
  const [response, setResponse] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"live" | "simulated" | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const hasKey = state.apiKey.length > 0;

  async function runLive() {
    if (!hasKey) {
      setError("No API key set. Paste an Anthropic key in Settings, or use Simulated.");
      return;
    }
    setRunning(true);
    setError(null);
    setResponse("");
    setMode("live");
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await callClaude(
        {
          apiKey: state.apiKey,
          model,
          system,
          messages: [{ role: "user", content: user }],
          max_tokens: maxTokens,
          temperature,
        },
        ac.signal,
      );
      setResponse(res.text);
      recordExerciseRun(moduleId, {
        exerciseId: exercise.id,
        timestamp: Date.now(),
        model,
        temperature,
        max_tokens: maxTokens,
        system,
        user,
        response: res.text,
        mode: "live",
      });
    } catch (e) {
      const msg = e instanceof AnthropicError ? e.message : e instanceof Error ? e.message : String(e);
      setError(msg);
      recordExerciseRun(moduleId, {
        exerciseId: exercise.id,
        timestamp: Date.now(),
        model,
        temperature,
        max_tokens: maxTokens,
        system,
        user,
        response: "",
        mode: "live",
        error: msg,
      });
    } finally {
      setRunning(false);
    }
  }

  function runSimulated() {
    setError(null);
    setMode("simulated");
    setResponse(exercise.simulated_response);
    recordExerciseRun(moduleId, {
      exerciseId: exercise.id,
      timestamp: Date.now(),
      model: "simulated",
      temperature,
      max_tokens: maxTokens,
      system,
      user,
      response: exercise.simulated_response,
      mode: "simulated",
    });
  }

  function reset() {
    setSystem(exercise.default_system);
    setUser(exercise.default_user);
    setResponse("");
    setError(null);
    setMode(null);
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-ink-700/60 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-50">{exercise.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-300">{exercise.instructions}</p>
          </div>
          <button
            onClick={reset}
            className="shrink-0 rounded-md p-1.5 text-ink-300 hover:bg-ink-800 hover:text-ink-100"
            aria-label="Reset to defaults"
            title="Reset to defaults"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-ink-300">
            System prompt
          </label>
          <textarea
            value={system}
            onChange={(e) => setSystem(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-ink-700 bg-ink-900/60 p-2.5 font-mono text-[12px] leading-relaxed text-ink-100 focus:border-gold-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-ink-300">
            User message
          </label>
          <textarea
            value={user}
            onChange={(e) => setUser(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-ink-700 bg-ink-900/60 p-2.5 font-mono text-[12px] leading-relaxed text-ink-100 focus:border-gold-400"
          />
        </div>
      </div>

      <div className="grid gap-4 border-t border-ink-700/60 px-5 py-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as ModelId)}
            className="w-full rounded-md border border-ink-700 bg-ink-900 px-2.5 py-2 text-sm text-ink-100 focus:border-gold-400"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink-300">
            <span>Temperature</span>
            <span className="font-mono text-gold-300">{temperature.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Max tokens
          </label>
          <select
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            className="w-full rounded-md border border-ink-700 bg-ink-900 px-2.5 py-2 text-sm text-ink-100 focus:border-gold-400"
          >
            {[256, 512, 1024, 2048, 4096].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-700/60 bg-ink-900/40 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={runLive}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run live
          </button>
          <button
            onClick={runSimulated}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-ink-600 px-4 py-2 text-sm font-medium text-ink-100 hover:border-gold-400 hover:text-gold-300"
            title="See an example output without making a live call"
          >
            <TestTube2 className="h-4 w-4" />
            Simulated
          </button>
        </div>
        {!hasKey && (
          <Link
            to="/settings"
            className="inline-flex items-center gap-1 text-xs font-medium text-gold-300 hover:underline"
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Add API key to run live
          </Link>
        )}
      </div>

      {error && (
        <div className="border-t border-rust-500/40 bg-rust-500/10 px-5 py-3 text-sm text-rust-400">
          {error}
        </div>
      )}

      {response && (
        <div className="border-t border-ink-700/60 px-5 py-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink-300">
            <Sparkles className="h-3.5 w-3.5 text-gold-300" />
            Response ({mode === "simulated" ? "simulated example" : `live · ${model}`})
          </div>
          <pre className="whitespace-pre-wrap break-words rounded-md bg-ink-950/60 p-3 font-mono text-[12.5px] leading-relaxed text-ink-100">
            {response}
          </pre>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-300">
            <span className="font-semibold text-gold-300">Leadership takeaway. </span>
            {exercise.leadership_takeaway}
          </p>
        </div>
      )}
    </div>
  );
}
