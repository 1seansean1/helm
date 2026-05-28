import { Link } from "react-router-dom";
import { ArrowRight, Apple, BookOpen, GraduationCap, Smartphone, Zap } from "lucide-react";

export function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-8 pb-16 md:pt-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-50">Help &amp; FAQ</h1>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link
          to="/pocket"
          className="card flex items-center gap-3 p-4 hover:border-gold-500/40"
        >
          <Zap className="h-5 w-5 text-gold-300" />
          <div>
            <div className="font-semibold text-ink-50">Pocket</div>
            <div className="text-xs text-ink-300">Tap-to-copy artifacts for the interview.</div>
          </div>
        </Link>
        <Link
          to="/tutorial"
          className="card flex items-center gap-3 p-4 hover:border-gold-500/40"
        >
          <GraduationCap className="h-5 w-5 text-gold-300" />
          <div>
            <div className="font-semibold text-ink-50">Replay the tutorial</div>
            <div className="text-xs text-ink-300">Eight-step guided tour, two minutes.</div>
          </div>
        </Link>
        <Link
          to="/worked-example"
          className="card flex items-center gap-3 p-4 hover:border-gold-500/40"
        >
          <BookOpen className="h-5 w-5 text-gold-300" />
          <div>
            <div className="font-semibold text-ink-50">Worked example</div>
            <div className="text-xs text-ink-300">Eleven capabilities on one banking problem.</div>
          </div>
        </Link>
      </div>

      <Section title="What is Helm?">
        <p>
          A coaching companion for product designers and PMs moving into AI leadership at a
          bank or fintech. Eleven modules, banking-anchored, each with vocabulary you can quote
          verbatim, an exercise you can run in the browser, and the leadership talking points
          you&apos;d carry into a product-team readout.
        </p>
      </Section>

      <Section title="What does &ldquo;bring your own key&rdquo; mean?">
        <p>
          Helm has no backend. There is no server to log into. To run exercises live against
          Claude, paste your own{" "}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
            className="text-gold-300 underline"
          >
            Anthropic API key
          </a>{" "}
          into Settings. It is stored only in your browser&apos;s localStorage and sent only to{" "}
          <code>api.anthropic.com</code> on the requests you initiate. Use the{" "}
          <strong>Forget key</strong> button to delete it any time.
        </p>
        <p>
          Don&apos;t want to use a key yet? Every exercise has a <strong>Simulated</strong>{" "}
          button that shows a realistic example response, so you can work through all eleven
          modules end-to-end without paying anything.
        </p>
      </Section>

      <Section title="Install on iPhone">
        <ol>
          <li>Open this page in Safari.</li>
          <li>
            Tap the Share button (<Apple className="inline h-3.5 w-3.5" />, the square with an
            up-arrow).
          </li>
          <li>Scroll and tap <strong>Add to Home Screen</strong>.</li>
          <li>Confirm. Helm now opens like a native app.</li>
        </ol>
      </Section>

      <Section title="Install on Android">
        <ol>
          <li>Open this page in Chrome.</li>
          <li>
            Tap the menu (<Smartphone className="inline h-3.5 w-3.5" />, three dots).
          </li>
          <li>Tap <strong>Install app</strong>.</li>
          <li>Confirm. Helm now opens like a native app.</li>
        </ol>
      </Section>

      <Section title="Does it work offline?">
        <p>
          Yes — the curriculum, exercises, your notes and your leadership brief all work
          without a network. Only the <em>Run live</em> button (and the <em>Refine with
          Claude</em> button on the leadership brief) requires connectivity.
        </p>
      </Section>

      <Section title="Why these eleven topics?">
        <p>
          They&apos;re the eleven capabilities a senior product designer or PM in banking needs
          to lead an AI program end-to-end: how to <em>choose</em> a model, how to{" "}
          <em>sample</em> from it, how to <em>wrap</em> it in a harness, how to{" "}
          <em>govern</em> it with context files, how to <em>compose</em> reusable skills and
          chain them into workflows, how to <em>automate</em> them into routines, how to{" "}
          <em>consolidate</em>, <em>extract</em>, and <em>summarize</em> their outputs at
          scale, and how to translate all of it into <em>leadership guidance</em> for a
          product team.
        </p>
      </Section>

      <Section title="Privacy">
        <p>
          No analytics. No telemetry. No third-party scripts beyond Google Fonts CSS (CSS only,
          no JS). Helm never sees your key or your data — it lives in your browser.
        </p>
      </Section>

      <div className="mt-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-gold-300"
        >
          Start with module 1 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="prose-helm mt-8 text-ink-200">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink-50">{title}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}
