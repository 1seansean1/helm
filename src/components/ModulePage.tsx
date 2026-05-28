import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  Check,
  CircleDashed,
  FileText,
  Landmark,
  Lightbulb,
  Quote,
} from "lucide-react";
import { MODULES } from "../curriculum";
import { useHelm } from "../state";
import { ExerciseRunner } from "./ExerciseRunner";

export function ModulePage() {
  const { id } = useParams<{ id: string }>();
  const module = useMemo(() => MODULES.find((m) => m.id === id), [id]);
  const idx = useMemo(() => MODULES.findIndex((m) => m.id === id), [id]);
  const { state, setModuleStatus, setModuleNotes } = useHelm();

  if (!module) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-ink-300">Module not found.</p>
        <Link className="mt-4 inline-flex items-center gap-1 text-gold-300" to="/">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </div>
    );
  }

  const progress = state.progress[module.id] ?? { status: "not_started", notes: "", exerciseRuns: [] };
  const prev = idx > 0 ? MODULES[idx - 1] : null;
  const next = idx < MODULES.length - 1 ? MODULES[idx + 1] : null;
  const completed = progress.status === "completed";

  return (
    <div className="mx-auto max-w-4xl px-5 pt-6 pb-16 md:pt-10">
      {/* Crumb */}
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-ink-300 hover:text-gold-300"
      >
        <ArrowLeft className="h-3 w-3" /> All modules
      </Link>

      {/* Title */}
      <header className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold-300">
          <span className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[10px]">
            {String(module.number).padStart(2, "0")} / {MODULES.length}
          </span>
          Module
        </div>
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink-50 md:text-5xl">
          {module.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-300 md:text-lg">{module.subtitle}</p>
      </header>

      {/* Summary */}
      <section className="prose-helm mb-10 text-ink-100">
        <p className="text-[15px] leading-relaxed text-ink-200">{module.summary}</p>
      </section>

      {/* Banking scenario */}
      <Section icon={Building2} title="Banking scenario">
        <div className="card-paper space-y-3 p-5 text-[15px]">
          <p className="text-ink-700">
            <span className="font-semibold text-ink-900">Setup. </span>
            {module.banking_scenario.setup}
          </p>
          <p className="text-ink-700">
            <span className="font-semibold text-ink-900">The question. </span>
            {module.banking_scenario.question}
          </p>
          <p className="text-ink-700">
            <span className="font-semibold text-ink-900">Why it matters. </span>
            {module.banking_scenario.why_it_matters}
          </p>
        </div>
      </Section>

      {/* Vocabulary */}
      <Section icon={BookOpenCheck} title="Interview-ready vocabulary">
        <ul className="grid gap-3 sm:grid-cols-2">
          {module.vocabulary.map((v) => (
            <li key={v.term} className="card p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-gold-300">{v.term}</div>
              <p className="mt-1 text-sm leading-relaxed text-ink-100">{v.definition}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-300">
                <span className="font-semibold text-ink-200">e.g.</span> {v.banking_example}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Key concepts */}
      <Section icon={Lightbulb} title="Key concepts">
        <ul className="space-y-3">
          {module.key_concepts.map((c) => (
            <li key={c.concept} className="card p-4">
              <div className="font-display text-base font-semibold text-ink-50">{c.concept}</div>
              <p className="mt-1 text-sm leading-relaxed text-ink-200">{c.explanation}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Exercises */}
      <Section icon={FileText} title="Try it">
        <div className="space-y-6">
          {module.exercises.map((ex) => (
            <ExerciseRunner key={ex.id} moduleId={module.id} exercise={ex} />
          ))}
        </div>
      </Section>

      {/* Self-check */}
      <Section icon={BadgeCheck} title="Self-check">
        <ul className="space-y-3">
          {module.self_check.map((sc, i) => (
            <li key={i} className="card p-4">
              <details>
                <summary className="cursor-pointer list-none text-sm font-semibold text-ink-100">
                  <span className="text-gold-300">Q.</span> {sc.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">
                  <span className="font-semibold text-ink-200">A. </span>
                  {sc.answer}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </Section>

      {/* Leadership talking points */}
      <Section icon={Landmark} title="What you'd say to your product team">
        <ul className="card space-y-2 p-5">
          {module.leadership_talking_points.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-100">
              <Quote className="mt-1 h-3.5 w-3.5 shrink-0 text-gold-300" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Notes */}
      <Section title="Your notes" icon={FileText}>
        <textarea
          value={progress.notes}
          onChange={(e) => setModuleNotes(module.id, e.target.value)}
          placeholder="What stood out? Translate to your own product context. These notes feed your leadership brief."
          className="w-full rounded-xl border border-ink-700 bg-ink-900/60 p-3 text-sm text-ink-100 placeholder:text-ink-400 focus:border-gold-400"
          rows={6}
        />
      </Section>

      {/* Mark complete + nav */}
      <section className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-ink-700/60 pt-6">
        <button
          onClick={() => setModuleStatus(module.id, completed ? "in_progress" : "completed")}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            completed
              ? "bg-moss-500/15 text-moss-400 ring-1 ring-moss-500/40"
              : "bg-gold-400 text-ink-950 hover:bg-gold-300"
          }`}
        >
          {completed ? (
            <>
              <Check className="h-4 w-4" /> Completed — undo
            </>
          ) : (
            <>
              <CircleDashed className="h-4 w-4" /> Mark complete
            </>
          )}
        </button>
        <div className="flex gap-2">
          {prev ? (
            <Link
              to={`/module/${prev.id}`}
              className="inline-flex items-center gap-1 rounded-full border border-ink-600 px-4 py-2 text-sm text-ink-100 hover:border-gold-400 hover:text-gold-300"
            >
              <ArrowLeft className="h-4 w-4" /> {prev.title}
            </Link>
          ) : null}
          {next ? (
            <Link
              to={`/module/${next.id}`}
              className="inline-flex items-center gap-1 rounded-full bg-ink-800 px-4 py-2 text-sm text-ink-100 hover:bg-ink-700"
            >
              {next.title} <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to="/leadership"
              className="inline-flex items-center gap-1 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-300"
            >
              Build your brief <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>
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
    <section className="mb-10">
      <div className="mb-3 flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-gold-300" strokeWidth={1.75} /> : null}
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink-50">{title}</h2>
      </div>
      {children}
    </section>
  );
}
