// Pocket — the paste-library.
// Every card answers one common interview prompt with a single tap-to-copy artifact.
// Most templates lift the curriculum's worked exercise outputs; the rest are inline.

import { MODULES } from "./curriculum";
import { WORKED_EXAMPLE } from "./worked-example";

export type PocketCategory = "soundbite" | "template" | "framework";

export interface PocketCard {
  id: string;
  category: PocketCategory;
  title: string;
  useWhen: string;
  preview: string;
  body: string;
  size: string;
  moduleId?: string;
}

// Helpers --------------------------------------------------------------------

function moduleSoundbite(moduleId: string): string {
  // Prefer the worked-example soundbite for the module; fall back to the
  // module's first leadership talking point.
  const we = WORKED_EXAMPLE.steps.find((s) => s.moduleId === moduleId)?.soundbite;
  if (we) return we;
  const m = MODULES.find((x) => x.id === moduleId)!;
  return m.leadership_talking_points[0];
}

function moduleSimulated(moduleId: string, exerciseId?: string): string {
  const m = MODULES.find((x) => x.id === moduleId)!;
  const ex = exerciseId ? m.exercises.find((e) => e.id === exerciseId) : m.exercises[0];
  return ex?.simulated_response ?? "";
}

function preview(body: string, n = 140): string {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > n ? flat.slice(0, n - 1).trimEnd() + "…" : flat;
}

function approxWords(s: string): string {
  const w = s.trim().split(/\s+/).length;
  return `~${w} words`;
}

// Inline frameworks ----------------------------------------------------------

const ELEVEN_CAPABILITY_SCAFFOLD = `## The eleven capabilities a product leader brings to a frontier-model program

1. **Model selection** — match the task to the smallest model with sufficient headroom over a measured eval.
2. **Sampling** — declare two regimes (deterministic for regulated surfaces, creative for brainstorming) and cap max_tokens per surface.
3. **Harness development** — design the runtime around the model: tools, retrieval, guardrails, HITL, observability.
4. **Context files** — author the org-wide CLAUDE.md / system-prompt library that every session inherits.
5. **Skills** — encode reusable procedures as named, versioned SKILL.md files invoked by description.
6. **Chaining skills into workflows** — sequence skills with typed handoffs, explicit gates, named compensations.
7. **Automating workflows into routines** — schedule + event-trigger the workflow under named ownership and a sunset clause.
8. **Consolidating results** — reduce in tiers; preserve outliers; cite every line; confidence-label every claim.
9. **Extracting results** — schema before prompt; validate, don't trust; engineer refusal as a feature.
10. **Summarizing results** — declare length tiers; measure faithfulness on a held-out set; alert on drift.
11. **Leadership guidance to a product team** — lead with frontiers, not lists. Name the won'ts. They earn you the wills.`;

const CAPABILITY_RISK_FRONTIER = `**Where we sit on the capability/risk frontier.** Customer-facing drafting, structured extraction, and triage have crossed the threshold of being reliably above the human-floor on bounded surfaces. Autonomous decisioning has not. The 18-month roadmap is designed around that asymmetry.`;

const BUILD_BUY_PARTNER_TRIAGE = `**Build / buy / partner — decision rule**

- **BUILD** when the capability touches our customers, our policy, or our logs (e.g. conversational support, dispute drafting). Vendor platforms force opaque retention or training contracts we will not sign.
- **BUY** when the capability is commodity, governance is already mapped, and time-to-value matters (e.g. document OCR, KYC vendors). Reassess in 12 months.
- **PARTNER** under a vendor-risk-management exception when the capability is novel and we want optionality (e.g. an emerging fraud-graph startup). Time-boxed; named exec sponsor; off-ramp clause.

Every decision runs through the same public scorecard: vendor risk model + cost envelope + capability fit. Politics decline when criteria are visible.`;

const HIRING_PROFILE_FIVE_ROLES = `**AI capability hiring profile — five named roles, not "AI engineers"**

1. **AI Product Lead** (1) — owns the eval portfolio, prioritization, and the will-ship/won't-ship line.
2. **AI Harness Engineer** (2) — builds and operates the runtimes that wrap the models (retrieval, tools, guardrails, observability).
3. **AI Eval Engineer** (1) — owns the per-surface eval sets, drift alerts, and the quarterly model-fitness report.
4. **AI Governance Partner** (1, dotted-line to Risk) — translates the AI Policy into shipped guardrails and audit artifacts.
5. **(Optional) Applied Researcher** (1) — frontier-watching, capability sketches, build/buy/partner technical due-diligence.

Tie each role to a named capability outcome. Resist generic headcount asks.`;

const TWO_REGIME_SAMPLING_POLICY = `**Two-regime sampling policy**

Every AI surface declares one of two regimes in its spec.

**Deterministic regime** — temperature 0.0; structured output where possible; pulls customer-facing text from a Legal-approved variant pool by index. Required for any output that touches a customer, a regulator, an auditor, or a compliance-impacting decision.

**Creative regime** — temperature 0.6–0.8; intended for internal brainstorming, marketing-copy ideation, exploratory analysis. Never reaches a customer without human review.

Avoid the middle (0.2–0.5) in production. It produces variance you cannot defend in either direction.

Log every (prompt, params, output) tuple for any surface touching customers — first-class compliance artifact.`;

const OBSERVABILITY_MINIMUM = `**Observability minimum — per AI harness call**

Required fields, logged synchronously, retained per the data-retention policy:

- \`turn_id\`, \`session_id\`, \`customer_id\` (encrypted)
- \`model_id\`, \`model_version\`
- \`retrieved_chunk_ids\` + \`source_version\` (which agreement / which fee schedule version)
- \`tools_called\` — name, arguments, return code, latency
- \`guardrail_hits\` — which fired, what was suppressed
- \`prompt\` + \`response\` (full, encrypted at rest)
- \`stop_reason\`
- \`latency_ms\` per stage + total
- \`input_tokens\`, \`output_tokens\`, \`cost_usd\`
- \`hitl_routed\` (boolean) + \`hitl_reason\` if true

Dashboards (build before the rollout, not after): per-surface pass-rate, escalation rate, p95 latency, daily spend, drift watch.`;

const AI_POLICY_V2 = `# AI Policy v2 — Consumer Banking (one page)

_Signed: [Head of Consumer], [CRO], [General Counsel] · Effective: [date] · Review: every 6 months_

## What we will use AI for
Drafting customer-facing content under approved templates; structured extraction from documents we already process; triage and routing within defined workflows; internal-only consolidation and summarization.

## What we will NOT use AI for
1. **Autonomous credit decisioning.** Model informs; a human decides every credit-impacting outcome.
2. **AI-generated marketing copy without human review.** Brand-tone risk; one viral miss costs more than the productivity gain.
3. **Training on customer transaction data without explicit, granular opt-in.** Trust posture. Not worth the upside.
4. **Autonomous customer-impacting actions.** Refunds, account changes, and dispute dispositions are proposed by AI, approved by a human.
5. **Replacing audit logs.** Every customer-impacting AI decision is logged with its full input, parameters, retrieved sources, and output, retained per data-retention policy.

## How decisions get made
Every new AI surface ships under a one-page spec naming: owner · use case · regime (deterministic | creative) · eval set + threshold · cost envelope · sunset/review date. The AI Governance Partner signs off; Risk reviews monthly.

## Roles
**AI Product Lead** (1) · **AI Harness Engineer** (2) · **AI Eval Engineer** (1) · **AI Governance Partner** (1, dotted-line to Risk).

## What we measure quarterly
Per-surface pass-rate against the eval set · drift in unsupported-claim rate · per-feature monthly cost · escalation rate to HITL · time-to-mitigation for any incident.

## What changes this policy
Material capability change (a new model class, a regulatory clarification) reopens this document. Minor changes are appendix updates and do not require re-signature.`;

// Cards ----------------------------------------------------------------------

function pushSoundbite(cards: PocketCard[], moduleId: string, useWhen: string) {
  const m = MODULES.find((x) => x.id === moduleId)!;
  const body = moduleSoundbite(moduleId);
  cards.push({
    id: `sb-${moduleId}`,
    category: "soundbite",
    title: `${m.title} — one-liner`,
    useWhen,
    preview: body,
    body,
    size: `${body.split(/\s+/).length} words`,
    moduleId,
  });
}

function pushSimulatedTemplate(
  cards: PocketCard[],
  args: { id: string; moduleId: string; title: string; useWhen: string; exerciseId?: string },
) {
  const body = moduleSimulated(args.moduleId, args.exerciseId);
  cards.push({
    id: args.id,
    category: "template",
    title: args.title,
    useWhen: args.useWhen,
    preview: preview(body, 160),
    body,
    size: approxWords(body),
    moduleId: args.moduleId,
  });
}

function buildPocket(): PocketCard[] {
  const cards: PocketCard[] = [];

  // ── Soundbites ──────────────────────────────────────────────────────────
  pushSoundbite(cards, "model-selection", "Asked how you pick a Claude model for a product.");
  pushSoundbite(cards, "sampling", "Asked how you balance creativity vs compliance in AI-drafted copy.");
  pushSoundbite(cards, "harness", "Asked how you scope an 'AI feature' beyond a prompt.");
  pushSoundbite(cards, "context-files", "Asked how you scale AI safely across hundreds of engineers.");
  pushSoundbite(cards, "skills", "Asked how you stop site-to-site playbook drift.");
  pushSoundbite(cards, "workflows", "Asked how you architect an AI-augmented business process.");
  pushSoundbite(cards, "routines", "Asked what AI maturity looks like to you.");
  pushSoundbite(cards, "consolidation", "Asked how you turn AI outputs into something execs trust.");
  pushSoundbite(cards, "extraction", "Asked how you handle hallucinations in production extraction.");
  pushSoundbite(cards, "summarization", "Asked how you handle quality control on summaries.");
  pushSoundbite(cards, "leadership", "Asked how you'd land an AI strategy with leadership.");

  cards.push({
    id: "sb-interview-pitch",
    category: "soundbite",
    title: "Why-you pitch — interview close",
    useWhen: "Asked: 'why should we hire you for this AI product role?'",
    preview: preview(WORKED_EXAMPLE.interview_pitch),
    body: WORKED_EXAMPLE.interview_pitch,
    size: approxWords(WORKED_EXAMPLE.interview_pitch),
  });

  // ── Templates (lifted from curriculum simulated responses) ──────────────
  pushSimulatedTemplate(cards, {
    id: "tpl-model-selection-defense",
    moduleId: "model-selection",
    title: "Model-selection defense — for an architecture review",
    useWhen: "Asked: 'defend using a smaller model for this feature' or 'why not Opus for everything?'",
  });
  pushSimulatedTemplate(cards, {
    id: "tpl-sampling-acknowledgement",
    moduleId: "sampling",
    title: "Push-notification copy — temp-0 disclosure variant",
    useWhen: "Asked for an example of regulated customer-facing AI copy.",
  });
  pushSimulatedTemplate(cards, {
    id: "tpl-tier1-harness-memo",
    moduleId: "harness",
    title: "Tier-1 support harness — architectural memo",
    useWhen: "Asked: 'how would you architect an AI customer-support agent?'",
  });
  pushSimulatedTemplate(cards, {
    id: "tpl-org-claude-md",
    moduleId: "context-files",
    title: "Org-wide CLAUDE.md — banking dev org",
    useWhen: "Asked: 'how do you govern AI use across a developer organization?'",
  });
  pushSimulatedTemplate(cards, {
    id: "tpl-dispute-case-packet-skill",
    moduleId: "skills",
    title: "SKILL.md — dispute-case-packet",
    useWhen: "Asked: 'show me what a reusable AI skill actually looks like'.",
  });
  pushSimulatedTemplate(cards, {
    id: "tpl-new-account-workflow",
    moduleId: "workflows",
    title: "Workflow spec — new-account opening (5 stages + gates)",
    useWhen: "Asked: 'how do you design a multi-step AI workflow with controls?'",
  });
  pushSimulatedTemplate(cards, {
    id: "tpl-weekly-fraud-routine",
    moduleId: "routines",
    title: "Routine spec — weekly fraud-anomalies",
    useWhen: "Asked for a worked example of automating a recurring analyst task.",
  });
  pushSimulatedTemplate(cards, {
    id: "tpl-voc-consolidation",
    moduleId: "consolidation",
    title: "Voice-of-customer weekly consolidation — full spec",
    useWhen: "Asked: 'how would you turn 6 feedback channels into one exec brief?'",
  });
  pushSimulatedTemplate(cards, {
    id: "tpl-loan-extract-schema",
    moduleId: "extraction",
    title: "Extraction contract — LoanApplicationExtract v1",
    useWhen: "Asked: 'show me a real structured-output schema for a document pipeline'.",
  });
  pushSimulatedTemplate(cards, {
    id: "tpl-central-bank-summarizer",
    moduleId: "summarization",
    title: "Central-bank document summarizer — service spec",
    useWhen: "Asked: 'how would you build a scaled summarization product?'",
  });
  pushSimulatedTemplate(cards, {
    id: "tpl-18-month-strategy",
    moduleId: "leadership",
    title: "18-month AI strategy — one-pager for a VP",
    useWhen: "Asked: 'what's your AI product strategy for our division?'",
  });

  cards.push({
    id: "tpl-acme-disputes-brief",
    category: "template",
    title: "Acme disputes — the consolidated brief (worked example)",
    useWhen: "Asked: 'walk me through a real AI program end-to-end'.",
    preview: preview(WORKED_EXAMPLE.consolidated_brief),
    body: WORKED_EXAMPLE.consolidated_brief,
    size: approxWords(WORKED_EXAMPLE.consolidated_brief),
  });

  cards.push({
    id: "tpl-ai-policy-v2",
    category: "template",
    title: "AI Policy v2 — one-page, ready-to-circulate",
    useWhen: "Asked: 'how would you get AI governance signed across the bank?'",
    preview: preview(AI_POLICY_V2),
    body: AI_POLICY_V2,
    size: approxWords(AI_POLICY_V2),
  });

  // ── Frameworks (inline) ─────────────────────────────────────────────────
  cards.push({
    id: "fw-eleven-capability-scaffold",
    category: "framework",
    title: "The eleven-capability scaffold",
    useWhen: "Asked: 'what does an AI product leader actually do?'",
    preview: preview(ELEVEN_CAPABILITY_SCAFFOLD),
    body: ELEVEN_CAPABILITY_SCAFFOLD,
    size: approxWords(ELEVEN_CAPABILITY_SCAFFOLD),
  });
  cards.push({
    id: "fw-capability-risk-frontier",
    category: "framework",
    title: "Capability/risk frontier — opening framing",
    useWhen: "Asked for your AI strategy in one breath.",
    preview: preview(CAPABILITY_RISK_FRONTIER),
    body: CAPABILITY_RISK_FRONTIER,
    size: approxWords(CAPABILITY_RISK_FRONTIER),
  });
  cards.push({
    id: "fw-build-buy-partner",
    category: "framework",
    title: "Build / buy / partner — decision rule",
    useWhen: "Asked how you'd choose between vendors and building in-house.",
    preview: preview(BUILD_BUY_PARTNER_TRIAGE),
    body: BUILD_BUY_PARTNER_TRIAGE,
    size: approxWords(BUILD_BUY_PARTNER_TRIAGE),
  });
  cards.push({
    id: "fw-hiring-profile-five-roles",
    category: "framework",
    title: "Hiring profile — five named roles",
    useWhen: "Asked what kind of team you'd build.",
    preview: preview(HIRING_PROFILE_FIVE_ROLES),
    body: HIRING_PROFILE_FIVE_ROLES,
    size: approxWords(HIRING_PROFILE_FIVE_ROLES),
  });
  cards.push({
    id: "fw-two-regime-sampling",
    category: "framework",
    title: "Two-regime sampling policy",
    useWhen: "Asked how you decide on temperature and parameters at scale.",
    preview: preview(TWO_REGIME_SAMPLING_POLICY),
    body: TWO_REGIME_SAMPLING_POLICY,
    size: approxWords(TWO_REGIME_SAMPLING_POLICY),
  });
  cards.push({
    id: "fw-observability-minimum",
    category: "framework",
    title: "Observability minimum — per AI harness call",
    useWhen: "Asked how you'd know the AI is working in production.",
    preview: preview(OBSERVABILITY_MINIMUM),
    body: OBSERVABILITY_MINIMUM,
    size: approxWords(OBSERVABILITY_MINIMUM),
  });

  return cards;
}

export const POCKET: PocketCard[] = buildPocket();

export const POCKET_BY_CATEGORY: Record<PocketCategory, PocketCard[]> = {
  soundbite: POCKET.filter((c) => c.category === "soundbite"),
  template: POCKET.filter((c) => c.category === "template"),
  framework: POCKET.filter((c) => c.category === "framework"),
};
