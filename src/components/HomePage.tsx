import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Compass,
  FileSignature,
  GitBranch,
  GraduationCap,
  Landmark,
  LayoutPanelLeft,
  ListChecks,
  MessageSquare,
  ScrollText,
  Settings2,
  Sliders,
  Sparkles,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { MODULES } from "../curriculum";
import { useHelm } from "../state";

const MODULE_ICON: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  "model-selection": Sparkles,
  sampling: Sliders,
  harness: Boxes,
  "context-files": ScrollText,
  skills: FileSignature,
  workflows: Workflow,
  routines: Settings2,
  consolidation: LayoutPanelLeft,
  extraction: ListChecks,
  summarization: GitBranch,
  leadership: Landmark,
};

export function HomePage() {
  const { state, setTutorialCompleted } = useHelm();
  const startedAny = Object.values(state.progress).some(
    (p) => p.status === "in_progress" || p.status === "completed",
  );
  const showTutorialBanner = !state.tutorialCompleted;

  return (
    <div className="mx-auto max-w-5xl px-5 pt-8 pb-12 md:pt-14">
      {showTutorialBanner && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-gold-500/30 bg-gold-500/[0.07] p-4 md:items-center">
          <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-gold-300 md:mt-0" />
          <div className="flex-1 text-sm text-ink-100">
            <span className="font-semibold text-ink-50">New here?</span> Take the two-minute
            guided tutorial — then jump into the worked example or start module 1.
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/tutorial"
              className="rounded-full bg-gold-400 px-4 py-1.5 text-xs font-semibold text-ink-950 hover:bg-gold-300"
            >
              Take the tour
            </Link>
            <button
              onClick={() => setTutorialCompleted(true)}
              aria-label="Dismiss tour prompt"
              className="rounded-full p-1.5 text-ink-300 hover:bg-ink-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="mb-10 md:mb-14">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold-300">
          <Compass className="h-3.5 w-3.5" />
          For product leaders in banking &amp; fintech
        </div>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-ink-50 md:text-6xl">
          Lead with frontier AI.
          <br />
          <span className="text-gold-300">Not just use it.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-200 md:text-lg">
          Eleven banking-anchored modules that move you from <em>I&apos;ve tried Claude</em> to
          <em> here is our AI product strategy, here are the won&apos;ts, here is who we hire,
          here is what we buy</em>. Bring your own Anthropic key; everything runs in your browser.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to={startedAny ? `/module/${MODULES[0].id}` : `/tutorial`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 shadow-glow transition hover:bg-gold-300"
          >
            {startedAny ? "Continue" : "Take the 2-min tutorial"} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/sandbox"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/[0.07] px-6 py-3 text-sm font-medium text-gold-200 transition hover:bg-gold-500/[0.18]"
          >
            <MessageSquare className="h-4 w-4" /> Open Sandbox
          </Link>
          <Link
            to="/worked-example"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-600 px-6 py-3 text-sm font-medium text-ink-100 transition hover:border-gold-400 hover:text-gold-300"
          >
            <BookOpen className="h-4 w-4" /> Worked example
          </Link>
        </div>
      </section>

      {/* Module grid */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-tight">The curriculum</h2>
          <span className="text-xs uppercase tracking-[0.18em] text-ink-300">
            {MODULES.length} modules
          </span>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {MODULES.map((m) => {
            const Icon = MODULE_ICON[m.id] ?? Sparkles;
            const status = state.progress[m.id]?.status ?? "not_started";
            return (
              <li key={m.id}>
                <Link
                  to={`/module/${m.id}`}
                  className="card group relative flex h-full flex-col gap-2 p-5 transition hover:border-gold-500/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink-300">
                      <span className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-gold-300">
                        {String(m.number).padStart(2, "0")}
                      </span>
                      <StatusPip status={status} />
                    </div>
                    <Icon className="h-5 w-5 text-ink-300 transition group-hover:text-gold-300" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-lg font-semibold tracking-tight text-ink-50">
                    {m.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-300">{m.subtitle}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        <Link to="/pocket" className="card-paper p-5 transition hover:shadow-lg sm:col-span-1">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gold-700">
            <Zap className="h-3 w-3" /> Interview mode
          </div>
          <h3 className="font-display text-xl font-semibold tracking-tight text-ink-900">
            Pocket — paste this
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">
            One-tap copy of every artifact: soundbites for the room, templates for the inbox,
            frameworks for the whiteboard. The surface you pull up <em>during</em> the interview.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-700">
            Open Pocket <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
        <Link to="/leadership" className="card p-5 transition hover:border-gold-500/40">
          <h3 className="font-display text-xl font-semibold tracking-tight text-ink-50">
            Your leadership brief
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-300">
            Auto-built from your own notes and exercise responses. Refine with Claude, download
            as Markdown.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-300">
            Open brief <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
        <Link
          to="/help"
          className="card flex flex-col justify-between p-5 transition hover:border-gold-500/40"
        >
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight text-ink-50">
              Install on your phone
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">
              iOS Safari &rarr; Share &rarr; <em>Add to Home Screen</em>. Android Chrome &rarr;
              menu &rarr; <em>Install app</em>. Offline after first load.
            </p>
          </div>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-300">
            How to install <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </section>
    </div>
  );
}

function StatusPip({ status }: { status: "not_started" | "in_progress" | "completed" }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-moss-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-moss-400">
        <span className="h-1.5 w-1.5 rounded-full bg-moss-500" /> done
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold-300">
        <span className="h-1.5 w-1.5 rounded-full bg-gold-400" /> in progress
      </span>
    );
  }
  return null;
}
