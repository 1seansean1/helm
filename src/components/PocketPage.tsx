import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Copy,
  FileSignature,
  FileText,
  Quote,
  Search,
  Share2,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { POCKET, POCKET_BY_CATEGORY, type PocketCategory, type PocketCard } from "../pocket";

const CATEGORIES: Array<{ key: "all" | PocketCategory; label: string; sub: string }> = [
  { key: "all",       label: "All",        sub: "Everything" },
  { key: "soundbite", label: "Soundbites", sub: "One-line quotes" },
  { key: "template",  label: "Templates",  sub: "Paste-ready artifacts" },
  { key: "framework", label: "Frameworks", sub: "Mental scaffolds" },
];

const ICON: Record<PocketCategory, React.ComponentType<{ className?: string }>> = {
  soundbite: Quote,
  template: FileText,
  framework: Sparkles,
};

export function PocketPage() {
  const [cat, setCat] = useState<"all" | PocketCategory>("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const h = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(h);
  }, [toast]);

  const cards = useMemo(() => {
    const base = cat === "all" ? POCKET : POCKET_BY_CATEGORY[cat];
    if (!query.trim()) return base;
    const q = query.trim().toLowerCase();
    return base.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.useWhen.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q),
    );
  }, [cat, query]);

  async function copyArtifact(card: PocketCard) {
    try {
      await navigator.clipboard.writeText(card.body);
      setToast(`Copied · ${card.title}`);
    } catch {
      setToast("Couldn't copy — long-press the preview to select instead.");
    }
  }

  async function shareArtifact(card: PocketCard) {
    if (navigator.share) {
      try {
        await navigator.share({ title: card.title, text: card.body });
      } catch {
        /* user cancelled */
      }
    } else {
      // Desktop fallback: prepare a mailto with the body
      const url = `mailto:?subject=${encodeURIComponent(card.title)}&body=${encodeURIComponent(card.body)}`;
      window.location.href = url;
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pt-6 pb-16 md:pt-12">
      {/* Header */}
      <header className="mb-5">
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold-300">
          <Zap className="h-3.5 w-3.5" /> Pocket
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-50 md:text-4xl">
          Paste this — one tap.
        </h1>
        <p className="mt-2 max-w-2xl text-ink-300">
          When an interviewer says <em>&ldquo;send me something&rdquo;</em>, this is what you
          send. Every card copies a clean, fully-formed artifact to your clipboard. Search by
          the question you&apos;re being asked.
        </p>
      </header>

      {/* Personalized brief banner */}
      <Link
        to="/leadership"
        className="card-paper mb-5 flex flex-wrap items-center gap-3 p-4 hover:shadow-lg"
      >
        <FileSignature className="h-5 w-5 shrink-0 text-gold-700" />
        <div className="flex-1 text-sm text-ink-800">
          <span className="font-semibold text-ink-900">Your own brief, built from your notes.</span>{" "}
          Auto-generated one-pager you can refine with Claude and download as Markdown.
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-gold-400 px-3 py-1.5 text-xs font-semibold text-ink-950">
          Open
        </span>
      </Link>

      {/* Search + categories */}
      <div className="sticky top-14 z-10 -mx-5 mb-5 border-b border-ink-700/60 bg-ink-950/85 px-5 py-3 backdrop-blur-md md:top-16">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search by question, "asked about pricing", "harness", "policy"…'
            className="w-full rounded-full border border-ink-700 bg-ink-900 py-2.5 pl-9 pr-9 text-sm text-ink-100 placeholder:text-ink-400 focus:border-gold-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-300 hover:bg-ink-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((c) => {
            const active = c.key === cat;
            const count = c.key === "all" ? POCKET.length : POCKET_BY_CATEGORY[c.key].length;
            return (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-gold-400 text-ink-950"
                    : "border border-ink-700 text-ink-200 hover:border-gold-400"
                }`}
              >
                {c.label}
                <span className={`ml-1.5 font-mono text-[10px] ${active ? "text-ink-800" : "text-ink-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards */}
      {cards.length === 0 && (
        <p className="rounded-xl border border-ink-700 bg-ink-900/40 p-6 text-center text-sm text-ink-300">
          Nothing matches &ldquo;{query}&rdquo;. Try a different question.
        </p>
      )}
      <ul className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <PocketCardView key={c.id} card={c} onCopy={copyArtifact} onShare={shareArtifact} />
        ))}
      </ul>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 md:bottom-8"
        >
          <div className="pointer-events-auto flex max-w-md items-center gap-2 rounded-full border border-moss-500/40 bg-moss-500/15 px-4 py-2 text-sm text-moss-400 shadow-soft backdrop-blur">
            <Check className="h-4 w-4" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PocketCardView({
  card,
  onCopy,
  onShare,
}: {
  card: PocketCard;
  onCopy: (c: PocketCard) => void;
  onShare: (c: PocketCard) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ICON[card.category];

  return (
    <li className="card flex h-full flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-2 border-b border-ink-700/60 px-4 py-3">
        <div className="flex items-start gap-2.5">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">
              {card.category} · {card.size}
            </div>
            <h3 className="font-display text-[15px] font-semibold leading-snug text-ink-50">
              {card.title}
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-4 py-3 text-sm">
        <p className="text-[12.5px] leading-relaxed text-ink-300">
          <span className="font-semibold text-gold-300">When </span>
          {card.useWhen}
        </p>
        <div
          className={`overflow-hidden rounded-md border border-ink-700/70 bg-ink-950/60 p-2.5 font-mono text-[11.5px] leading-relaxed text-ink-200 ${
            expanded ? "max-h-[60vh] overflow-auto" : "max-h-24"
          }`}
        >
          {expanded ? card.body : card.preview}
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] text-ink-300 hover:text-gold-300"
        >
          {expanded ? "Collapse" : "Preview full text"}
        </button>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-700/60 bg-ink-900/40 px-4 py-2.5">
        <button
          onClick={() => onCopy(card)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gold-400 px-3 py-1.5 text-xs font-semibold text-ink-950 hover:bg-gold-300"
        >
          <Copy className="h-3.5 w-3.5" /> Copy
        </button>
        <button
          onClick={() => onShare(card)}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink-600 px-3 py-1.5 text-xs text-ink-100 hover:border-gold-400 hover:text-gold-300"
          aria-label="Share"
        >
          <Share2 className="h-3.5 w-3.5" /> Send
        </button>
        {card.moduleId && (
          <Link
            to={`/module/${card.moduleId}`}
            className="hidden text-[11px] text-ink-300 hover:text-gold-300 sm:inline"
          >
            Source
          </Link>
        )}
      </div>
    </li>
  );
}
