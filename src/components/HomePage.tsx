import { Link } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  Compass,
  FileSignature,
  GitBranch,
  Landmark,
  LayoutPanelLeft,
  ListChecks,
  ScrollText,
  Settings2,
  Sliders,
  Sparkles,
  Workflow,
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
  const { state } = useHelm();
  const startedAny = Object.values(state.progress).some(
    (p) => p.status === "in_progress" || p.status === "completed",
  );

  return (
    <div className="mx-auto max-w-5xl px-5 pt-8 pb-12 md:pt-14">
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
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            to={startedAny ? `/module/${MODULES[0].id}` : `/help`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 shadow-glow transition hover:bg-gold-300"
          >
            {startedAny ? "Continue" : "Start here"} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/settings"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-600 px-6 py-3 text-sm font-medium text-ink-100 transition hover:border-gold-400 hover:text-gold-300"
          >
            Configure your API key
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

      <section className="mt-14 grid gap-4 sm:grid-cols-2">
        <Link to="/leadership" className="card-paper p-5 transition hover:shadow-lg">
          <h3 className="font-display text-xl font-semibold tracking-tight">
            Export your leadership brief
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">
            When you&apos;ve worked through the modules, consolidate everything you&apos;ve
            written into a single one-pager you can hand a VP — or quote in an interview.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-700">
            Open brief <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
        <Link
          to="/help"
          className="card flex flex-col justify-between p-5 transition hover:border-gold-500/40"
        >
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight text-ink-50">
              Install Helm on your phone
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">
              On iOS: Safari &rarr; Share &rarr; <em>Add to Home Screen</em>. On Android:
              Chrome menu &rarr; <em>Install app</em>. Works offline after first load.
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
