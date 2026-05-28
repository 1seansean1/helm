import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Download,
  FileText,
  KeySquare,
  LineChart,
  Play,
  Sailboat,
  Smartphone,
  Sparkles,
  TestTube2,
} from "lucide-react";
import { useHelm } from "../state";

interface Step {
  key: string;
  eyebrow: string;
  title: string;
  body: React.ReactNode;
  primary: { label: string; to?: string; action?: "next" | "finish" };
  secondary?: { label: string; to?: string; action?: "next" };
}

export function TutorialPage() {
  const { state, setTutorialCompleted } = useHelm();
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const hasKey = state.apiKey.length > 0;

  const steps: Step[] = [
    {
      key: "welcome",
      eyebrow: "Tutorial · 1 of 8",
      title: "Welcome to Helm.",
      body: (
        <>
          <p>
            Helm is a coaching companion that moves you from <em>I&apos;ve tried Claude</em> to
            <em> here is our AI product strategy</em> — banking-tailored throughout.
          </p>
          <p>
            Eleven modules. Each one has banking-anchored vocabulary you can quote in an
            interview, a worked scenario, an interactive exercise, self-check questions, and
            the leadership talking points you would carry into a product-team readout.
          </p>
          <p>
            This tutorial is two minutes. You can skip it any time and replay from{" "}
            <code>Help</code>.
          </p>
        </>
      ),
      primary: { label: "Start the tour", action: "next" },
      secondary: { label: "Skip", action: "next" },
    },
    {
      key: "byo-key",
      eyebrow: "Tutorial · 2 of 8",
      title: "Pick your mode.",
      body: (
        <>
          <p>
            Helm has no backend. To run exercises <strong>live</strong> against Claude, paste
            your own <a className="text-gold-300 underline" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">Anthropic API key</a> into Settings. It stays in your browser
            and is sent only to <code>api.anthropic.com</code> on requests you initiate.
          </p>
          <p>
            Don&apos;t want a key yet? Every exercise has a <strong>Simulated</strong> button
            that shows a realistic example response. The full curriculum works end-to-end
            without a key.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              to="/settings"
              className="card flex items-center gap-3 p-4 hover:border-gold-500/40"
            >
              <KeySquare className="h-5 w-5 text-gold-300" />
              <div>
                <div className="font-semibold text-ink-50">Add API key</div>
                <div className="text-xs text-ink-300">Run exercises live against Claude.</div>
              </div>
            </Link>
            <button
              onClick={() => setI(i + 1)}
              className="card flex items-center gap-3 p-4 text-left hover:border-gold-500/40"
            >
              <TestTube2 className="h-5 w-5 text-gold-300" />
              <div>
                <div className="font-semibold text-ink-50">Use Simulated only</div>
                <div className="text-xs text-ink-300">Walk through everything cost-free.</div>
              </div>
            </button>
          </div>
          {hasKey && (
            <p className="mt-3 inline-flex items-center gap-1 text-xs text-moss-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> A key is configured — you can run live.
            </p>
          )}
        </>
      ),
      primary: { label: "Next", action: "next" },
    },
    {
      key: "module-shape",
      eyebrow: "Tutorial · 3 of 8",
      title: "What a module looks like.",
      body: (
        <>
          <p>Every module has the same seven sections, in this order:</p>
          <ol className="mt-3 space-y-1.5 text-[15px]">
            <li><span className="font-semibold text-gold-300">Banking scenario.</span> A concrete fintech setup with a sharp question.</li>
            <li><span className="font-semibold text-gold-300">Vocabulary.</span> Interview-ready term/definition pairs with banking examples.</li>
            <li><span className="font-semibold text-gold-300">Key concepts.</span> The mental models you want at hand.</li>
            <li><span className="font-semibold text-gold-300">Try it.</span> A runnable exercise (live or simulated).</li>
            <li><span className="font-semibold text-gold-300">Self-check.</span> Two or three questions to test understanding.</li>
            <li><span className="font-semibold text-gold-300">What you&apos;d say to your product team.</span> Talking points you can quote.</li>
            <li><span className="font-semibold text-gold-300">Your notes.</span> Free-text capture — feeds the leadership brief.</li>
          </ol>
          <p className="mt-3">
            Nothing here is filler. Each section earns its place.
          </p>
        </>
      ),
      primary: { label: "Next", action: "next" },
    },
    {
      key: "exercise",
      eyebrow: "Tutorial · 4 of 8",
      title: "Anatomy of an exercise.",
      body: (
        <>
          <p>Each exercise is a small, real harness around the Claude API. You can see and edit:</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <DemoBlock label="System prompt" body="You are a senior product manager at a US national bank..." />
            <DemoBlock label="User message" body="Draft 6 crisp bullets defending Haiku for transaction categorization..." />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Mini label="Model" value="Sonnet 4.6" />
            <Mini label="Temperature" value="0.4" />
            <Mini label="Max tokens" value="1024" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-400 px-3 py-1.5 text-xs font-semibold text-ink-950">
              <Play className="h-3 w-3" /> Run live
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-ink-600 px-3 py-1.5 text-xs">
              <TestTube2 className="h-3 w-3" /> Simulated
            </span>
          </div>
          <p className="mt-3">
            <strong>Tip:</strong> run the same prompt at temperature 0 and 0.9 once — that
            single comparison teaches sampling better than any reading.
          </p>
        </>
      ),
      primary: { label: "Next", action: "next" },
    },
    {
      key: "progress",
      eyebrow: "Tutorial · 5 of 8",
      title: "Track your progress.",
      body: (
        <>
          <p>
            Each module has a <strong>Mark complete</strong> button at the bottom. You don&apos;t
            have to — it&apos;s for you, not us. The Progress page rolls up status across all
            eleven modules.
          </p>
          <div className="mt-4 card-paper p-4">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink-700">
              <span>Progress</span>
              <span>3 of 11 · 27%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-200">
              <div className="h-full w-[27%] bg-gradient-to-r from-gold-400 to-moss-400" />
            </div>
          </div>
          <p className="mt-3">
            Every exercise run you do (live or simulated) is captured so it can flow into your
            leadership brief on the next step.
          </p>
        </>
      ),
      primary: { label: "Next", action: "next" },
    },
    {
      key: "brief",
      eyebrow: "Tutorial · 6 of 8",
      title: "Build your leadership brief.",
      body: (
        <>
          <p>
            The <Link to="/leadership" className="text-gold-300 underline">Brief</Link> view
            consolidates your per-module notes and your latest exercise responses into one
            Markdown document — sized for a VP one-pager.
          </p>
          <ul className="mt-3 space-y-1.5 text-[15px]">
            <li><Sparkles className="inline h-3.5 w-3.5 text-gold-300" /> Where you sit on the capability/risk frontier.</li>
            <li><Sparkles className="inline h-3.5 w-3.5 text-gold-300" /> Three things you will ship.</li>
            <li><Sparkles className="inline h-3.5 w-3.5 text-gold-300" /> Three things you explicitly will not.</li>
            <li><Sparkles className="inline h-3.5 w-3.5 text-gold-300" /> Hiring profile and build/buy/partner triage.</li>
            <li><Sparkles className="inline h-3.5 w-3.5 text-gold-300" /> The single ask: an AI Policy v2 signature.</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-400 px-3 py-1.5 text-xs font-semibold text-ink-950">
              <Sparkles className="h-3 w-3" /> Refine with Claude
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-ink-600 px-3 py-1.5 text-xs">
              <Download className="h-3 w-3" /> Download .md
            </span>
          </div>
        </>
      ),
      primary: { label: "Next", action: "next" },
    },
    {
      key: "install",
      eyebrow: "Tutorial · 7 of 8",
      title: "Install Helm on your phone.",
      body: (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold text-ink-50">
                <Smartphone className="h-4 w-4 text-gold-300" /> iOS
              </div>
              <ol className="space-y-1 text-sm text-ink-200">
                <li>1. Open this page in Safari.</li>
                <li>2. Tap Share (square with up-arrow).</li>
                <li>3. Tap <em>Add to Home Screen</em>.</li>
              </ol>
            </div>
            <div className="card p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold text-ink-50">
                <Smartphone className="h-4 w-4 text-gold-300" /> Android
              </div>
              <ol className="space-y-1 text-sm text-ink-200">
                <li>1. Open this page in Chrome.</li>
                <li>2. Tap the menu (three dots).</li>
                <li>3. Tap <em>Install app</em>.</li>
              </ol>
            </div>
          </div>
          <p className="mt-3">
            After install, Helm works offline for the entire curriculum. Only the{" "}
            <em>Run live</em> button needs the network.
          </p>
        </>
      ),
      primary: { label: "Next", action: "next" },
    },
    {
      key: "finish",
      eyebrow: "Tutorial · 8 of 8",
      title: "You're ready.",
      body: (
        <>
          <p>Two doors to walk through.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Link
              to="/worked-example"
              className="card flex flex-col gap-2 p-4 hover:border-gold-500/40"
            >
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gold-300">
                <BookOpen className="h-3.5 w-3.5" /> Worked example
              </div>
              <div className="font-display text-lg font-semibold text-ink-50">
                See all eleven applied to one problem
              </div>
              <p className="text-sm text-ink-300">
                Acme Bank disputes: $2.1M/month to a one-page strategy. The story you could
                rehearse for an interview.
              </p>
            </Link>
            <Link
              to="/module/model-selection"
              className="card flex flex-col gap-2 p-4 hover:border-gold-500/40"
            >
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gold-300">
                <Compass className="h-3.5 w-3.5" /> Start the curriculum
              </div>
              <div className="font-display text-lg font-semibold text-ink-50">
                Module 1 — Model selection
              </div>
              <p className="text-sm text-ink-300">
                Choosing the right model for the job, not the loudest one.
              </p>
            </Link>
          </div>
          <p className="mt-4 inline-flex items-center gap-1 text-xs text-ink-300">
            <LineChart className="h-3.5 w-3.5 text-gold-300" />
            Replay this tutorial any time from <Link to="/help" className="text-gold-300 underline">Help</Link>.
          </p>
        </>
      ),
      primary: { label: "Finish & go to module 1", to: "/module/model-selection", action: "finish" },
      secondary: { label: "See worked example", to: "/worked-example", action: "finish" },
    },
  ];

  const step = steps[i];
  const last = i === steps.length - 1;

  function go(action?: "next" | "finish", to?: string) {
    if (action === "finish" || last) setTutorialCompleted(true);
    if (to) navigate(to);
    else if (action === "next") setI(Math.min(i + 1, steps.length - 1));
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pt-8 pb-16 md:pt-12">
      <div className="mb-6 flex items-center gap-2">
        <Sailboat className="h-4 w-4 text-gold-300" />
        <span className="text-[11px] uppercase tracking-[0.22em] text-gold-300">{step.eyebrow}</span>
      </div>

      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-50 md:text-4xl">
        {step.title}
      </h1>

      <div className="prose-helm mt-6 max-w-none space-y-3 text-[15px] leading-relaxed text-ink-200">
        {step.body}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-ink-700/60 pt-5">
        <button
          onClick={() => setI(Math.max(0, i - 1))}
          disabled={i === 0}
          className="inline-flex items-center gap-1 rounded-full border border-ink-700 px-3 py-1.5 text-xs text-ink-300 hover:text-ink-100 disabled:opacity-40"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="flex gap-2">
          {step.secondary && (
            <button
              onClick={() => go(step.secondary!.action, step.secondary!.to)}
              className="inline-flex items-center gap-1 rounded-full border border-ink-600 px-4 py-2 text-sm text-ink-100 hover:border-gold-400 hover:text-gold-300"
            >
              {step.secondary.label}
            </button>
          )}
          <button
            onClick={() => go(step.primary.action ?? "next", step.primary.to)}
            className="inline-flex items-center gap-1 rounded-full bg-gold-400 px-5 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-300"
          >
            {step.primary.label} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-1.5">
        {steps.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Jump to step ${idx + 1}`}
            className={`h-1.5 rounded-full transition ${
              idx === i ? "w-8 bg-gold-400" : "w-2 bg-ink-700 hover:bg-ink-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function DemoBlock({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-ink-300">{label}</div>
      <div className="rounded-md border border-ink-700 bg-ink-900/60 p-2.5 font-mono text-[12px] leading-relaxed text-ink-100">
        {body}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-700 bg-ink-900/60 p-2.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-300">{label}</div>
      <div className="font-mono text-sm text-gold-300">{value}</div>
    </div>
  );
}

// Hide the small FileText import only used in the worked-example linking from this file;
// keeping import present avoids tree-shake-vs-typecheck noise during builds.
void FileText;
