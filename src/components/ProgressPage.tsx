import { Link } from "react-router-dom";
import { Check, CircleDashed, Circle } from "lucide-react";
import { MODULES } from "../curriculum";
import { useHelm, computeOverall } from "../state";

export function ProgressPage() {
  const { state, resetAllProgress } = useHelm();
  const overall = computeOverall(state.progress, MODULES.length);

  return (
    <div className="mx-auto max-w-3xl px-5 pt-8 pb-12 md:pt-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-50">Progress</h1>
      <p className="mt-2 text-ink-300">
        {overall.completed} of {overall.totalModules} modules completed ({overall.percent}%);
        {" "}{overall.inProgress} in progress; {overall.notStarted} not started.
      </p>

      <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-ink-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-400 to-moss-400 transition-all"
          style={{ width: `${overall.percent}%` }}
        />
      </div>

      <ul className="mt-8 space-y-2">
        {MODULES.map((m) => {
          const p = state.progress[m.id]?.status ?? "not_started";
          const runs = state.progress[m.id]?.exerciseRuns?.length ?? 0;
          return (
            <li key={m.id}>
              <Link
                to={`/module/${m.id}`}
                className="card flex items-center justify-between gap-3 p-4 transition hover:border-gold-500/40"
              >
                <div className="flex items-center gap-3">
                  <StatusGlyph status={p} />
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-400">
                      {String(m.number).padStart(2, "0")}
                    </div>
                    <div className="font-display text-base font-semibold text-ink-50">{m.title}</div>
                  </div>
                </div>
                <div className="text-right text-[11px] uppercase tracking-[0.18em] text-ink-300">
                  {runs > 0 ? `${runs} run${runs === 1 ? "" : "s"}` : "no runs yet"}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 border-t border-ink-700/60 pt-6">
        <button
          onClick={() => {
            if (confirm("Reset all module progress (keeps your API key + settings)?")) {
              resetAllProgress();
            }
          }}
          className="rounded-full border border-rust-500/40 px-4 py-2 text-xs font-medium text-rust-400 hover:bg-rust-500/10"
        >
          Reset all progress
        </button>
      </div>
    </div>
  );
}

function StatusGlyph({ status }: { status: "not_started" | "in_progress" | "completed" }) {
  if (status === "completed") return <Check className="h-5 w-5 text-moss-500" strokeWidth={2.2} />;
  if (status === "in_progress") return <CircleDashed className="h-5 w-5 text-gold-400" />;
  return <Circle className="h-5 w-5 text-ink-500" />;
}
