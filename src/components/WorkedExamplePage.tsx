import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Download,
  FileSignature,
  Landmark,
  Loader2,
  Quote,
  Sparkles,
  Target,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { WORKED_EXAMPLE } from "../worked-example";
import { useHelm } from "../state";
import { callClaude, AnthropicError } from "../lib/anthropic";

export function WorkedExamplePage() {
  const { state } = useHelm();
  const [refined, setRefined] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const briefMarkdown = useMemo(() => buildBriefMarkdown(), []);

  async function refine() {
    if (!state.apiKey) {
      setErr("Add a key in Settings to refine with Claude, or download the brief as-is.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await callClaude({
        apiKey: state.apiKey,
        model: "claude-sonnet-4-6",
        system:
          "You sharpen the writing of a banking AI strategy brief without inventing facts. Keep the structure. Tighten verbs. Drop fluff. Preserve every concrete number.",
        messages: [
          { role: "user", content: `Refine this brief. Output ONLY the refined markdown.\n\n---\n\n${briefMarkdown}` },
        ],
        max_tokens: 3000,
        temperature: 0.4,
      });
      setRefined(res.text);
    } catch (e) {
      setErr(e instanceof AnthropicError || e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function download() {
    const text = refined || briefMarkdown;
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `helm-worked-example-acme-disputes-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-4xl px-5 pt-8 pb-16 md:pt-12">
      {/* Eyebrow */}
      <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold-300">
        <BookOpen className="h-3.5 w-3.5" /> Worked example
      </div>

      {/* Title */}
      <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink-50 md:text-5xl">
        {WORKED_EXAMPLE.title}
      </h1>
      <p className="mt-3 text-base text-ink-300 md:text-lg">{WORKED_EXAMPLE.subtitle}</p>

      {/* Hero line */}
      <div className="prose-helm mt-6 rounded-2xl border border-gold-500/20 bg-gold-500/[0.04] p-5 text-[15px] leading-relaxed text-ink-100">
        <p>{WORKED_EXAMPLE.hero_one_liner}</p>
      </div>

      {/* The problem */}
      <Section icon={Target} title="The problem">
        <div className="card-paper p-5">
          <p className="text-[15px] leading-relaxed text-ink-800">
            <span className="font-semibold text-ink-900">Setup. </span>
            {WORKED_EXAMPLE.problem.setup}
          </p>
          <div className="mt-4">
            <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-700">
              Measured today
            </div>
            <ul className="space-y-1 text-[14.5px] text-ink-800">
              {WORKED_EXAMPLE.problem.measured_today.map((m, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-mono text-gold-700">·</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-800">
            <span className="font-semibold text-ink-900">Why it matters. </span>
            {WORKED_EXAMPLE.problem.why_it_matters}
          </p>
        </div>
      </Section>

      {/* Eleven steps */}
      <Section icon={Sparkles} title="Eleven capabilities, one workflow">
        <ol className="space-y-3">
          {WORKED_EXAMPLE.steps.map((s) => (
            <li key={s.number} className="card overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-ink-700/60 px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-gold-500/15 px-2 py-1 font-mono text-[11px] text-gold-300">
                    {String(s.number).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-ink-300">
                      Module
                    </div>
                    <div className="font-display text-base font-semibold text-ink-50">
                      {s.capability}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/module/${s.moduleId}`}
                  className="hidden shrink-0 items-center gap-1 rounded-full border border-ink-700 px-3 py-1 text-[11px] text-ink-300 hover:border-gold-400 hover:text-gold-300 sm:inline-flex"
                >
                  Open module <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-3 px-5 py-4">
                <p className="text-[14.5px] leading-relaxed text-ink-200">
                  <span className="font-semibold text-ink-50">What you do. </span>
                  {s.what_you_do}
                </p>
                <p className="text-[14.5px] leading-relaxed text-ink-200">
                  <span className="font-semibold text-gold-300">The concrete artifact. </span>
                  {s.concrete_artifact}
                </p>
                <div className="flex gap-2 rounded-md border-l-2 border-gold-400 bg-gold-500/[0.06] px-3 py-2">
                  <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-300" />
                  <p className="text-[14px] italic leading-relaxed text-ink-100">{s.soundbite}</p>
                </div>
                <Link
                  to={`/module/${s.moduleId}`}
                  className="inline-flex items-center gap-1 text-xs text-gold-300 hover:underline sm:hidden"
                >
                  Open module <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Consolidated brief */}
      <Section icon={FileSignature} title="The one-page leadership brief">
        <div className="card-paper p-5 text-[15px] leading-relaxed text-ink-800">
          <p>{WORKED_EXAMPLE.consolidated_brief}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={refine}
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
        </div>
        {err && (
          <p className="mt-3 rounded-md border border-rust-500/40 bg-rust-500/10 px-3 py-2 text-xs text-rust-400">
            {err}
          </p>
        )}
        {refined && (
          <div className="card mt-4 p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gold-300">
              <Sparkles className="h-3.5 w-3.5" /> Refined draft
            </div>
            <pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-relaxed text-ink-100">
              {refined}
            </pre>
          </div>
        )}
      </Section>

      {/* Outcomes */}
      <Section icon={TrendingUp} title="What you promise — and measure against">
        <ul className="card grid gap-2 p-5 sm:grid-cols-2">
          {WORKED_EXAMPLE.outcomes_promised.map((o, i) => (
            <li key={i} className="flex gap-2 text-[14.5px] text-ink-100">
              <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss-400" />
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Interview pitch */}
      <Section icon={Landmark} title="If they ask you why you, in the interview">
        <div className="rounded-2xl border border-gold-500/30 bg-gradient-to-br from-gold-500/[0.08] to-transparent p-5">
          <Quote className="mb-2 h-5 w-5 text-gold-300" />
          <p className="font-display text-lg leading-relaxed text-ink-50 md:text-xl">
            {WORKED_EXAMPLE.interview_pitch}
          </p>
        </div>
      </Section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          to="/module/model-selection"
          className="inline-flex items-center gap-1 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-gold-300"
        >
          Start with module 1 <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/leadership"
          className="inline-flex items-center gap-1 rounded-full border border-ink-600 px-5 py-2.5 text-sm font-medium text-ink-100 hover:border-gold-400 hover:text-gold-300"
        >
          Build your own brief
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-gold-300" strokeWidth={1.75} /> : null}
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink-50">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function buildBriefMarkdown(): string {
  const w = WORKED_EXAMPLE;
  const lines: string[] = [];
  lines.push(`# ${w.title}`);
  lines.push("");
  lines.push(`_${w.subtitle}_`);
  lines.push("");
  lines.push(`## The problem`);
  lines.push("");
  lines.push(w.problem.setup);
  lines.push("");
  lines.push(`**Measured today.**`);
  for (const m of w.problem.measured_today) lines.push(`- ${m}`);
  lines.push("");
  lines.push(`**Why it matters.** ${w.problem.why_it_matters}`);
  lines.push("");
  lines.push(`## Eleven capabilities, applied`);
  lines.push("");
  for (const s of w.steps) {
    lines.push(`### ${String(s.number).padStart(2, "0")}. ${s.capability}`);
    lines.push("");
    lines.push(`**What you do.** ${s.what_you_do}`);
    lines.push("");
    lines.push(`**Concrete artifact.** ${s.concrete_artifact}`);
    lines.push("");
    lines.push(`> ${s.soundbite}`);
    lines.push("");
  }
  lines.push(`## Consolidated leadership brief`);
  lines.push("");
  lines.push(w.consolidated_brief);
  lines.push("");
  lines.push(`## Outcomes promised`);
  lines.push("");
  for (const o of w.outcomes_promised) lines.push(`- ${o}`);
  lines.push("");
  lines.push(`## Interview pitch`);
  lines.push("");
  lines.push(`> ${w.interview_pitch}`);
  return lines.join("\n");
}
