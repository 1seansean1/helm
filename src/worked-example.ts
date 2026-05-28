// Helm — one banking problem, all eleven capabilities applied end-to-end.
// The worked example a candidate could rehearse and quote in an interview.

export interface CapabilityStep {
  number: number;
  moduleId: string;
  capability: string;
  what_you_do: string;
  concrete_artifact: string;
  soundbite: string;
}

export interface WorkedExample {
  id: string;
  title: string;
  subtitle: string;
  hero_one_liner: string;
  problem: {
    setup: string;
    measured_today: string[];
    why_it_matters: string;
  };
  steps: CapabilityStep[];
  consolidated_brief: string;
  outcomes_promised: string[];
  interview_pitch: string;
}

export const WORKED_EXAMPLE: WorkedExample = {
  id: "acme-disputes",
  title: "From a $2.1M/month problem to a one-page strategy",
  subtitle: "Applying all eleven Helm capabilities to one real banking workflow.",
  hero_one_liner:
    "Acme Bank Tier-1 disputes. 12,000 cases per week. Three sites, three playbooks, nine-day median time-to-disposition. This is how a senior product designer turns it into one harness, one workflow, one routine, and one signed page of policy.",

  problem: {
    setup:
      "You are the incoming senior product designer for Acme Bank's consumer-card disputes flow. Three operations sites — Phoenix, Tampa, Manila — each handle disputes against a divergent 200-page playbook. Customers wait days for acknowledgement; agents re-key the same fields into the case-management system; the disputes desk drafts the same kinds of memos over and over.",
    measured_today: [
      "12,000 disputes/week across the three sites.",
      "Median time-to-disposition: 9 days. p95: 17 days.",
      "Per-case cost (loaded labor + tooling): $174.",
      "Total monthly run-cost: ~$2.1M.",
      "Customer NPS for the disputes flow: -22.",
      "Reg E exception rate (cases mishandled vs the regulation): 4.6%.",
    ],
    why_it_matters:
      "This is the kind of problem a senior product role is judged on. The first sixty days are not 'try a model on it.' The first sixty days are: bring the eleven capabilities below to bear, make each choice visible, and walk into the next review with the artifacts that make the answer obvious.",
  },

  steps: [
    {
      number: 1,
      moduleId: "model-selection",
      capability: "Model selection",
      what_you_do:
        "Decompose the disputes pipeline into named workloads, score each against capability, latency, and cost. Map each workload to the smallest model that clears its eval.",
      concrete_artifact:
        "A three-row table: classification (Haiku 4.5 — 50ms budget, 0.012¢/case), case-narrative drafting (Sonnet 4.6 — 2s budget, 0.18¢/case), regulatory escalation memos (Opus 4.7 — 10min budget, 4.2¢/case). Per-month spend at projected volumes: $640. Replaces the 'use the biggest model for everything' debate before it happens.",
      soundbite:
        "We don't pick models; we pick evals and budgets. The model that falls out of those two artifacts is the model that ships.",
    },
    {
      number: 2,
      moduleId: "sampling",
      capability: "Sampling",
      what_you_do:
        "Codify two regimes — deterministic for anything customer-facing or regulated, creative for internal brainstorming. Cap max_tokens aggressively per surface.",
      concrete_artifact:
        "Disputes sampling spec v1. Customer SMS acknowledgement: temperature 0, max_tokens 128, drawn from a Legal-approved variant pool. Internal narrative: temperature 0.3, max_tokens 1024. Edge-case memo brainstorm (internal only): temperature 0.7. Every (prompt, params, output) tuple logged to the audit store.",
      soundbite:
        "On any regulated surface, variation is a compliance defect, not a UX win. The sampling settings are the policy.",
    },
    {
      number: 3,
      moduleId: "harness",
      capability: "Harness development",
      what_you_do:
        "Draw the harness: request shape, retrieval sources, tools exposed, guardrails, human-in-the-loop triggers, observability minimum.",
      concrete_artifact:
        "Disputes harness v1. Tools: get_transaction, get_customer_history, get_merchant_profile, search_similar_cases, create_provisional_credit, escalate_to_human. Retrieval: cardholder agreement (versioned), Reg E rulings library, prior 12 months of cases at the merchant. Guardrails: PII redaction in logs; refusal to issue provisional credit > $25k; classification-confidence floor 0.8. HITL: any dispute > $5k, any second-in-session escalation, any sentiment < -0.7. Observability minimum: per-call inputs, tools fired, guardrail hits, latency per stage, cost. The dashboard exists before the rollout.",
      soundbite:
        "Ship the dashboard before the first customer touches the feature; not after.",
    },
    {
      number: 4,
      moduleId: "context-files",
      capability: "Context files",
      what_you_do:
        "Author the disputes-org CLAUDE.md — three sections: Voice, Rules (with named regulatory references), Procedures. Keep under one screen; push detail to references.",
      concrete_artifact:
        "Disputes CLAUDE.md v1.0, 480 words. Voice: under 80-word replies, no apology preambles, no exclamation marks. Rules: cite Reg E §1005 when applicable; never include customer SSN or full account number in narrative; cite cardholder agreement version on every case; never auto-issue refunds — propose, agent approves. Procedures: escalation chart, how to handle a guardrail trip, who owns updates. Pinned in every harness session across all three sites.",
      soundbite:
        "Owning the org-wide CLAUDE.md is the cheapest, highest-leverage senior role at a bank rolling out AI. Make sure that role is named.",
    },
    {
      number: 5,
      moduleId: "skills",
      capability: "Skills",
      what_you_do:
        "Encode the playbook as named, versioned skills. Replace three drifted site playbooks with one source of truth invoked by the harness.",
      concrete_artifact:
        "Five skills committed to the registry: dispute-classify (Reg E + internal taxonomy), dispute-narrative (markdown case writeup with citations), dispute-customer-ack (approved-variant pool selector), dispute-fraud-flag (pattern-match against fraud-graph), dispute-escalation-memo (Opus, for senior reviewer). Each skill is a SKILL.md with named inputs, numbered procedure, named outputs, and explicit refusal conditions. Phoenix, Tampa, and Manila now invoke the same skill registry; site-specific tuning is configuration, not playbook divergence.",
      soundbite:
        "Skills are how you turn three drifted playbooks into one running source of truth. Training shifts from 'memorize the playbook' to 'know when to invoke the skill.'",
    },
    {
      number: 6,
      moduleId: "workflows",
      capability: "Chaining skills into workflows",
      what_you_do:
        "Sequence the skills with explicit gates, typed artifact handoffs, SLAs per stage, named compensating actions.",
      concrete_artifact:
        "DisputeWorkflow v1: intake → classify → enrich → narrative → review-gate → comms → close. Gates: classification confidence < 0.8 → human review (queue: senior-reviewer, SLA 4h); amount > $25k → fraud team (SLA 1h); customer's third dispute this quarter → senior PM. Compensation: re-queue comms on delivery failure; reverse provisional credit if review denies. Observability on the wall: end-to-end p50/p95, per-gate flow rate, compensation-fire rate.",
      soundbite:
        "Customers experience workflows, not skills. Optimize the chain, not just the steps.",
    },
    {
      number: 7,
      moduleId: "routines",
      capability: "Automating workflows into routines",
      what_you_do:
        "Wrap the parts of the workflow that should run without a human asking — the nightly roll-up, the threshold-triggered triage — and name an owner for each.",
      concrete_artifact:
        "nightly-disputes-rollup: weekday 02:30 local, lands in inboxes by 07:00. Aggregates the day's classifications, dispositions, outliers, and any guardrail hits; flags edge cases for the on-call analyst. Owner: disputes ops lead. Cost budget: $180/month. Sunset review: +90 days. queue-pressure-triage: wakes when the queue exceeds 200 items, runs prioritization workflow, notifies queue owner.",
      soundbite:
        "Maturity of an AI program isn't 'how many routines do you have.' It's 'who owns each one, and what's its sunset date.'",
    },
    {
      number: 8,
      moduleId: "consolidation",
      capability: "Consolidating results",
      what_you_do:
        "Roll the week's outputs into a single artifact directors will read — tiered reduction, explicit outlier section, citations on every bullet, confidence labels.",
      concrete_artifact:
        "Weekly disputes voice-of-customer brief. One-line headline for the dashboard, eight-bullet summary for the team channel, two-page brief for the consumer-product head. Top 5 themes by (volume × WoW delta × severity); explicit 'unusual signals' section for outlier-bucket items; every line cites the cluster id (drillable to source cases). Confidence rubric: HIGH ≥ 50 cases × ≥ 3 channels; MEDIUM ≥ 15 × ≥ 2; LOW under that.",
      soundbite:
        "The point of consolidation is not the brief. It's the trust that lets the team act on the brief without re-reading the underlying data.",
    },
    {
      number: 9,
      moduleId: "extraction",
      capability: "Extracting results",
      what_you_do:
        "Define the structured contract the case-management system depends on. Schema first; prompt second. Build refusal into the model's response.",
      concrete_artifact:
        "DisputeCaseExtract v1 schema. Fields: case_id, transaction_id, customer_segment, classification (enum: unauthorized | duplicate | merchandise-not-received | merchandise-not-as-described | billing-error | recurring-not-canceled), reg_e_eligible, amount, recommended_disposition, citations (per field: page, offset, snippet), refusals (per field: reason). Validator chain: schema → business rules → cross-field. Refusals on any of {classification, amount, reg_e_eligible} route to human review with the reason attached.",
      soundbite:
        "When a vendor claims 95% extraction accuracy, ask whether the other 5% is silently wrong or loudly refused. Engineer for loudly refused.",
    },
    {
      number: 10,
      moduleId: "summarization",
      capability: "Summarizing results",
      what_you_do:
        "Define length tiers per audience; measure faithfulness on a held-out eval set; alert on drift.",
      concrete_artifact:
        "Disputes summarizer v1. Tiers: dashboard one-liner (≤25 words), morning-call three-bullet (≤90 words), directors' one-page memo (550–650 words). Style adapter: every output opens with 'Bottom line:' Faithfulness eval: 50 historical (case packet, gold memo) pairs; automated unsupported-claim count + weekly human spot-check of 3. Drift alert: > 2% unsupported in any 5-memo window → banner 'DRIFT WATCH' until eval recovers.",
      soundbite:
        "Faithfulness is the only summary metric that matters. One fabricated claim destroys trust irrespective of fluency.",
    },
    {
      number: 11,
      moduleId: "leadership",
      capability: "Leadership guidance to a product team",
      what_you_do:
        "Walk into your VP review with one page: capability/risk frontier, named will-ships, named won't-ships, hiring profile, build/buy/partner triage, and the single artifact the VP needs to sign.",
      concrete_artifact:
        "Disputes AI strategy, 18 months, one page. WILL ship: Tier-1 disputes harness (handle time -35%), document extraction (re-keying eliminated), weekly VoC routine. WILL NOT ship: autonomous denials, AI-drafted marketing, training on customer data without opt-in. Hiring: 1 AI Product Lead, 2 Harness Engineers, 1 Eval Engineer, 1 AI Governance Partner (dotted-line to Risk). BUY vertical OCR vendor; BUILD the harness on Claude. Ask: signed AI Policy v2 (one page) that codifies the won'ts and creates the Governance Partner role.",
      soundbite:
        "Lead with frontiers, not lists. Name the won'ts. They earn you the wills.",
    },
  ],

  consolidated_brief:
    "**AI strategy for Acme consumer disputes — 18 months.** Frontier-model capability has crossed the threshold where drafting, structured extraction, and triage are reliably above human-floor on the disputes surface. Autonomous decisioning has not. Our roadmap is designed around that asymmetry. **We will ship** the Tier-1 disputes harness, the loan/onboarding document-extraction pipeline (architecturally identical to disputes extraction), and the weekly voice-of-customer consolidation routine. **We will not ship** autonomous denials, AI-drafted marketing copy, or training on customer transaction data without opt-in. **Hiring:** five FTEs to named roles (PM, Harness ×2, Eval, Governance), not 'a team of AI engineers.' **Build/buy/partner:** BUY vertical OCR; BUILD the harness on Claude under our governance; reassess in 12 months. **One signature:** AI Policy v2, one page — codifies the won'ts and creates the AI Governance Partner role. With it, every individual feature becomes a clean go/no-go; without it, every feature is litigated from scratch.",

  outcomes_promised: [
    "Median time-to-disposition: 9 days → 36 hours.",
    "p95 time-to-disposition: 17 days → 5 days.",
    "Per-case cost: $174 → $39 (-77%).",
    "Monthly run-cost: $2.1M → ~$480k.",
    "Customer NPS for disputes flow: -22 → +12 (target).",
    "Reg E exception rate: 4.6% → 1.6% (-65%).",
    "Three site playbooks → one skill registry; site variance becomes configuration, not divergence.",
  ],

  interview_pitch:
    "I'd walk in on day one with a one-page AI strategy and the eleven artifacts behind it. The eleven aren't decoration — they're the discipline that lets a senior product role land a number like 'median nine days to thirty-six hours' without hand-waving. The model is the engine; the harness is the car; the skill registry is the playbook; the routine is the cadence; the consolidation is the trust; the leadership page is the cover that lets everything else ship. I built and rehearsed this on Helm; I'd run it the same way on day one at Acme.",
};
