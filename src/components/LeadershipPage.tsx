import { useMemo, useState } from "react";
import { Download, FileText, Loader2, Sparkles, Wand2 } from "lucide-react";
import { MODULES } from "../curriculum";
import { useHelm } from "../state";
import { callClaude, AnthropicError } from "../lib/anthropic";

export function LeadershipPage() {
  const { state } = useHelm();
  const [draft, setDraft] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const baseBrief = useMemo(() => buildBaseBrief(state.progress), [state.progress]);

  async function refineWithClaude() {
    if (!state.apiKey) {
      setErr("Add an API key in Settings, or use the base brief as-is.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await callClaude({
        apiKey: state.apiKey,
        model: "claude-sonnet-4-6",
        system:
          "You are a senior product designer at a US national bank, refining a leadership readout for a VP of Consumer Banking. Keep the structure provided. Sharpen the writing, tighten the bullets, ensure every recommendation is concrete. Do not invent facts that aren't in the input.",
        messages: [
          {
            role: "user",
            content: `Refine the following AI leadership brief. Keep section headings. Output the refined markdown ONLY — no preamble.\n\n---\n\n${baseBrief}`,
          },
        ],
        max_tokens: 3000,
        temperature: 0.4,
      });
      setDraft(res.text);
    } catch (e) {
      const msg = e instanceof AnthropicError ? e.message : e instanceof Error ? e.message : String(e);
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  const briefToShow = draft || baseBrief;

  function download() {
    const blob = new Blob([briefToShow], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `helm-leadership-brief-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pt-8 pb-16 md:pt-12">
      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold-300">
          <Sparkles className="h-3.5 w-3.5" />
          The artifact is the job
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-50 md:text-4xl">
          Your leadership brief
        </h1>
        <p className="mt-2 text-ink-300">
          Consolidates the notes and exercise responses from each module into one document you
          can carry into a VP conversation or quote in an interview. Refine with Claude or
          download as Markdown.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-3">
        <button
          onClick={refineWithClaude}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-gold-300 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Refine with Claude
        </button>
        <button
          onClick={download}
          className="inline-flex items-center gap-2 rounded-full border border-ink-600 px-5 py-2.5 text-sm font-medium text-ink-100 hover:border-gold-400 hover:text-gold-300"
        >
          <Download className="h-4 w-4" />
          Download .md
        </button>
        {draft && (
          <button
            onClick={() => setDraft("")}
            className="inline-flex items-center gap-2 rounded-full border border-ink-700 px-4 py-2 text-xs text-ink-300 hover:text-ink-100"
          >
            Revert to base
          </button>
        )}
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-rust-500/40 bg-rust-500/10 px-4 py-2 text-sm text-rust-400">
          {err}
        </div>
      )}

      <div className="card-paper p-6">
        <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink-700">
          <FileText className="h-3.5 w-3.5" />
          {draft ? "Refined draft" : "Base brief (auto-generated from your notes)"}
        </div>
        <pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-relaxed text-ink-900">
          {briefToShow}
        </pre>
      </div>
    </div>
  );
}

function buildBaseBrief(progress: ReturnType<typeof useHelm>["state"]["progress"]) {
  const lines: string[] = [];
  const date = new Date().toISOString().slice(0, 10);
  lines.push(`# AI product leadership brief`);
  lines.push(``);
  lines.push(`_Drafted ${date} via Helm. For discussion with VP, Consumer Banking._`);
  lines.push(``);
  lines.push(`## Executive summary`);
  lines.push(``);
  lines.push(
    "Frontier-model AI is past the demo stage in banking. The question is no longer whether to use it but where to apply it, where to refuse it, and how to govern it. This brief consolidates eleven concrete capability areas — model selection, sampling, harness, context, skills, workflows, routines, consolidation, extraction, summarization, and leadership posture — into a single recommendation surface.",
  );
  lines.push(``);
  lines.push(`## Where we sit on the capability/risk frontier`);
  lines.push(``);
  lines.push(
    "Customer-facing drafting, structured extraction, and triage have crossed the threshold of being reliably above the human-floor on bounded surfaces. Autonomous decisioning has not. Our 18-month roadmap should be designed around that asymmetry.",
  );
  lines.push(``);
  lines.push(`## Per-capability notes`);
  lines.push(``);
  for (const m of MODULES) {
    const p = progress[m.id];
    lines.push(`### ${String(m.number).padStart(2, "0")}. ${m.title}`);
    lines.push(``);
    lines.push(`_${m.subtitle}_`);
    lines.push(``);
    if (p?.notes?.trim()) {
      lines.push(`**Your notes.** ${p.notes.trim()}`);
      lines.push(``);
    }
    lines.push(`**Talking points.**`);
    for (const tp of m.leadership_talking_points) lines.push(`- ${tp}`);
    if (p?.exerciseRuns?.length) {
      const latest = p.exerciseRuns[0];
      lines.push(``);
      lines.push(`**Latest exercise response (${latest.mode}, model: ${latest.model}).**`);
      lines.push(``);
      lines.push("```");
      lines.push(latest.response.trim() || "(no response captured)");
      lines.push("```");
    }
    lines.push(``);
  }
  lines.push(`## What we WILL ship in the next 18 months`);
  lines.push(``);
  lines.push(`1. Tier-1 customer-support harness on Claude (drafted replies, human-approved actions).`);
  lines.push(`2. Document-extraction pipeline for loan/onboarding packets (refuses to humans on uncertainty).`);
  lines.push(`3. Weekly voice-of-customer consolidation routine for the consumer-product directors.`);
  lines.push(``);
  lines.push(`## What we WILL NOT ship`);
  lines.push(``);
  lines.push(`1. Autonomous credit decisioning — model informs, human decides.`);
  lines.push(`2. AI-generated marketing copy that ships without human review.`);
  lines.push(`3. Model training on customer data without opt-in.`);
  lines.push(``);
  lines.push(`## Hiring profile`);
  lines.push(``);
  lines.push(`1 AI Product Lead. 2 AI Harness Engineers. 1 AI Eval Engineer. 1 AI Governance Partner (dotted-line to Risk).`);
  lines.push(``);
  lines.push(`## The single ask`);
  lines.push(``);
  lines.push(
    `A signed AI Policy v2 (one page): codifies the WON'Ts, names the AI Governance Partner role, and makes every shipped feature a clean go/no-go.`,
  );
  return lines.join("\n");
}
