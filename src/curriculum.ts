// Helm — banking-tailored AI product mastery curriculum.
// 11 modules. Every block grounded in a fintech scenario the user can quote in an interview.

export interface VocabularyEntry {
  term: string;
  definition: string;
  banking_example: string;
}

export interface KeyConcept {
  concept: string;
  explanation: string;
}

export interface BankingScenario {
  setup: string;
  question: string;
  why_it_matters: string;
}

export interface Exercise {
  id: string;
  title: string;
  instructions: string;
  default_system: string;
  default_user: string;
  suggested_model?: "claude-opus-4-7" | "claude-sonnet-4-6" | "claude-haiku-4-5-20251001";
  suggested_temperature?: number;
  suggested_max_tokens?: number;
  simulated_response: string;
  leadership_takeaway: string;
}

export interface SelfCheck {
  question: string;
  answer: string;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  summary: string;
  vocabulary: VocabularyEntry[];
  banking_scenario: BankingScenario;
  key_concepts: KeyConcept[];
  exercises: Exercise[];
  self_check: SelfCheck[];
  leadership_talking_points: string[];
}

export const MODULES: Module[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 01 — Model selection
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "model-selection",
    number: 1,
    title: "Model selection",
    subtitle: "Choosing the right model for the job, not the loudest one",
    summary:
      "Frontier-model families now span a capability/latency/cost gradient. A product leader's first job is to match the model to the task — never default to the biggest model, and never default to the cheapest one. Picking well is a competitive moat; picking poorly is a line item the CFO will eventually ask about.",
    vocabulary: [
      {
        term: "Frontier model",
        definition:
          "The current-generation top-tier model from a major lab (e.g. Claude Opus 4.7, GPT-5, Gemini Ultra). Highest capability, highest cost.",
        banking_example:
          "Reading a 200-page swap agreement and surfacing every covenant that would trip if SOFR rises 75 bps.",
      },
      {
        term: "Mid-tier model",
        definition:
          "The capable-but-cheaper sibling (e.g. Claude Sonnet 4.6). Optimized for the bulk of production workloads.",
        banking_example:
          "Drafting personalized monthly statement narratives for 4M retail customers.",
      },
      {
        term: "Fast/cheap model",
        definition:
          "The latency-optimized sibling (e.g. Claude Haiku 4.5). Sub-second responses, pennies per million tokens.",
        banking_example:
          "Real-time categorization of transactions in the mobile app feed.",
      },
      {
        term: "Capability ceiling",
        definition:
          "The hardest task a model can reliably complete. A model below ceiling produces brittle, hallucination-prone outputs.",
        banking_example:
          "Asking a small model to reason about a complex tax-loss-harvesting trade is below ceiling for that model — it will confabulate.",
      },
      {
        term: "Cost-per-task envelope",
        definition:
          "The cost a model incurs amortized over an end-user-visible task, not per token. The unit that matters in product economics.",
        banking_example:
          "A dispute-resolution drafting flow costs $0.012 per case on Sonnet vs $0.09 on Opus — at 20k disputes/day, that is $570k/yr.",
      },
    ],
    banking_scenario: {
      setup:
        "You lead product for the consumer banking app. Your team is shipping three Claude-powered features in Q3: a real-time transaction categorizer, a customer-support assistant, and a regulatory-comment-letter drafter for the Compliance team.",
      question:
        "Which Claude model do you propose for each, and how do you defend the choice in the architecture review?",
    why_it_matters:
        "Choosing one model for all three optimizes for engineering laziness, not user value or cost. The default-everything-to-Opus instinct burns budget the Compliance feature actually needs.",
    },
    key_concepts: [
      {
        concept: "Task-to-model fit",
        explanation:
          "Score every task on four axes: reasoning depth, latency budget, cost envelope, failure cost. Plot tasks before plotting models.",
      },
      {
        concept: "Headroom over ceiling",
        explanation:
          "Pick the smallest model that has at least 1.5x headroom over the task's ceiling. Headroom absorbs distribution shift in the wild.",
      },
      {
        concept: "Mixed-model architectures",
        explanation:
          "Production systems route per-request to different models. A triage call (Haiku) decides whether to escalate to Sonnet or Opus.",
      },
      {
        concept: "Model lock-in risk",
        explanation:
          "Hard-coding model IDs into a hundred features creates a migration cliff. Centralize model selection behind a router you control.",
      },
    ],
    exercises: [
      {
        id: "ex-1-1",
        title: "Defend a model selection in an architecture review",
        instructions:
          "Pretend you're presenting to the Chief Risk Officer. Ask Claude to draft a 6-bullet defense for using Haiku for transaction categorization, Sonnet for support, and Opus for regulatory comment letters. The CRO is skeptical of using anything but the most capable model.",
        default_system:
          "You are a senior product manager at a US national bank presenting an AI architecture decision to the Chief Risk Officer. Be specific, quantified, and risk-aware. Refer to concrete failure modes the CRO will care about (mis-categorization rate, hallucinated dispute facts, regulatory ambiguity).",
        default_user:
          "Draft 6 crisp bullets defending: Haiku 4.5 for real-time transaction categorization (50ms budget, 20M requests/day), Sonnet 4.6 for customer-support drafting (2s budget, 80k requests/day), Opus 4.7 for regulatory comment-letter drafting (10 minute budget, 30 requests/week). Cite concrete failure-cost reasoning the CRO can carry into her own update to the board.",
        suggested_model: "claude-sonnet-4-6",
        suggested_temperature: 0.4,
        suggested_max_tokens: 1024,
        simulated_response:
          "1. Transaction categorization at 20M req/day cannot tolerate a 1s tail; Haiku 4.5 lands at ~250ms p95 and the categorization task sits well below its capability ceiling — measured 99.4% agreement with our gold set, well above the 98.5% threshold the fraud team requires.\n2. Routing every transaction through Opus would cost ~$2.1M/mo at observed token volumes versus ~$38k/mo for Haiku, with no measurable user-visible quality lift.\n3. Customer-support drafting requires multi-turn reasoning over the customer's profile and case history; Sonnet 4.6 holds context coherently across 8+ turns where Haiku begins to drift, and shaves ~40% off agent handle time in the A/B already running in pilot region.\n4. Regulatory comment-letter drafting is the highest-failure-cost surface in this set: a single mis-cited rule subjects the bank to enforcement risk. Opus 4.7's published reasoning benchmarks and our own 30-letter eval against retired senior counsel show Opus matches counsel's first-draft quality at 78% acceptance, Sonnet at 51%. The cost delta (~$0.42/letter) is rounding error against external counsel rates.\n5. All three models sit behind a single model-router service we own; a future re-route is a config change, not a code migration.\n6. Quarterly we re-run the eval set and publish drift metrics — the CRO receives a one-page model-fitness report every QBR.",
        leadership_takeaway:
          "A senior product leader does not pick models — she picks evals and budgets. The eval defines the ceiling test; the budget defines the envelope; the model that sits in the box falls out. Bring those two artifacts to the review and the model choice becomes obvious to the room.",
      },
    ],
    self_check: [
      {
        question:
          "Why is 'use the most capable model everywhere' usually wrong even when budget is not tight?",
        answer:
          "Capability headroom buys you nothing on tasks already well below the ceiling; it costs latency the user feels, and it ties the product to one vendor's pricing curve. The right framing is 'smallest model with sufficient headroom over a measured eval.'",
      },
      {
        question:
          "What artifact should a product leader carry into a model-selection review?",
        answer:
          "A task-segmented eval set with pass-rate thresholds per task, and a per-task cost envelope. Without both, model debate is vibes.",
      },
    ],
    leadership_talking_points: [
      "Centralize model selection behind a router your team owns; never let model IDs leak into feature code.",
      "Publish a one-page quarterly model-fitness report at QBR; pre-empt the 'why aren't we using the new model' question.",
      "Insist that every AI feature ship with a named owner of its eval set, not just its code.",
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 02 — Sampling
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "sampling",
    number: 2,
    title: "Sampling",
    subtitle: "Temperature, top-p, max tokens — and why your compliance team should care",
    summary:
      "Sampling parameters control how the model chooses its next token. They are the difference between 'always answers the same way' and 'gives me five fresh marketing variants.' In a bank, knowing which parameters belong on which features is a regulatory conversation as much as a quality one.",
    vocabulary: [
      {
        term: "Temperature",
        definition:
          "A scalar (typically 0.0–1.0) that flattens or sharpens the probability distribution over next tokens. 0 is deterministic; higher is more diverse.",
        banking_example:
          "Disclosure language: 0.0. Marketing tagline brainstorm: 0.8.",
      },
      {
        term: "top_p (nucleus sampling)",
        definition:
          "Restrict sampling to the smallest set of tokens whose cumulative probability ≥ p. Caps the long tail of unlikely tokens.",
        banking_example:
          "Use top_p 0.9 to keep brand-tone-compliant copy while allowing variation.",
      },
      {
        term: "max_tokens",
        definition:
          "Hard ceiling on output length. Independent of temperature; protects cost and latency.",
        banking_example:
          "Cap chat-bot replies at 256 tokens so a user on a thin mobile connection doesn't wait 20s for a thesis.",
      },
      {
        term: "Stop sequences",
        definition:
          "Strings that, when emitted, halt generation immediately. Used to enforce structure.",
        banking_example:
          "Stop on '---END OF DISCLOSURE---' to guarantee no trailing chatter after legal language.",
      },
      {
        term: "Determinism",
        definition:
          "Same input + same params → same output. Temperature 0 + a fixed seed where supported. Required for many audit contexts.",
        banking_example:
          "A compliance-attested risk classifier must reproduce its label given the same trade ticket, every time.",
      },
    ],
    banking_scenario: {
      setup:
        "Your team is rolling out Claude-drafted SMS responses for a credit-card disputes queue. Legal has signed off on three approved phrasings of 'we've received your dispute and opened case #X.' Marketing wants tone variation. Compliance wants reproducibility for the audit trail.",
      question:
        "What sampling configuration ships, and how do you explain the tradeoff to Marketing and Compliance simultaneously?",
      why_it_matters:
        "Get this wrong and either Legal pulls the feature (drift from approved language) or Marketing pulls support (every SMS reads the same). The settings ARE the product policy.",
    },
    key_concepts: [
      {
        concept: "Two regimes, not a spectrum",
        explanation:
          "In production, treat temperature as either 'deterministic mode' (0.0, regulated/auditable surface) or 'creative mode' (0.6–0.8, brainstorming/marketing). Avoid the middle — it produces variance you can't defend.",
      },
      {
        concept: "max_tokens as cost control",
        explanation:
          "max_tokens is your single most underused production lever. Cap it aggressively per surface; raise it deliberately when a use case proves out.",
      },
      {
        concept: "Stop sequences enforce structure",
        explanation:
          "When you need JSON or a known terminator, stop sequences are more reliable than asking nicely. They are policy, not a hint.",
      },
      {
        concept: "Reproducibility for audit",
        explanation:
          "Any model output that influences a customer-impacting decision should be reproducible from logged inputs + params. Build the log path before you ship the feature.",
      },
    ],
    exercises: [
      {
        id: "ex-2-1",
        title: "Same prompt, two temperatures — feel the difference",
        instructions:
          "Run this prompt twice: once at temperature 0.0, once at 0.9. Compare the outputs. Then write down (in your own words) why a bank would choose each setting for a different surface.",
        default_system:
          "You are a copywriter for a US national bank's consumer card product. Tone: warm but unambiguous. Never make claims about APR or rewards.",
        default_user:
          "Write a 2-sentence push notification confirming we received the customer's payment dispute. Mention the case number placeholder {CASE_ID}.",
        suggested_model: "claude-haiku-4-5-20251001",
        suggested_max_tokens: 256,
        simulated_response:
          "We've received your dispute and opened case {CASE_ID}. You'll hear from us within 5 business days — no action needed from you in the meantime.",
        leadership_takeaway:
          "Run the same prompt at temperature 0 and 0.9 in front of your design team once. Nobody who watches the demo asks 'do sampling parameters really matter' again.",
      },
    ],
    self_check: [
      {
        question:
          "A teammate wants to use temperature 0.5 for a regulated-disclosure surface because 'it sounds more natural.' What do you say?",
        answer:
          "Disclosed language must be reproducible and pre-approved. Variation in regulated copy is a compliance defect, not a UX win. Move to temperature 0 with a curated, legal-approved variant pool selected programmatically.",
      },
      {
        question:
          "Why is max_tokens a product decision, not just a cost knob?",
        answer:
          "It directly shapes user experience — perceived response speed, message density on mobile, whether a chat bubble fits on screen. Caps belong in the product spec, not the eng config.",
      },
    ],
    leadership_talking_points: [
      "Codify two regimes — deterministic and creative — and require every AI feature to declare which regime it ships in.",
      "Log every (prompt, params, output) tuple for surfaces touching customers; treat this log as a first-class compliance artifact.",
      "Re-evaluate sampling settings quarterly: model upgrades shift optimal parameters.",
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 03 — Harness development
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "harness",
    number: 3,
    title: "Harness development",
    subtitle: "The runtime that wraps the model — and is most of the product",
    summary:
      "A 'harness' is the runtime scaffolding around a model: retrieval, tool use, memory, retries, evaluation, guardrails, observability, and human-in-the-loop. The model is the engine; the harness is the car. Bank product managers who learn this vocabulary stop arguing about prompts and start designing systems.",
    vocabulary: [
      {
        term: "Harness",
        definition:
          "The end-to-end runtime that orchestrates a model: input shaping, tool calls, retries, output validation, logging, escalation.",
        banking_example:
          "Your support agent's harness handles auth, fetches the customer's profile, calls the model, validates the response, logs to the audit store, escalates to a human if confidence is low.",
      },
      {
        term: "Tool use",
        definition:
          "The pattern where a model emits a structured request to call a function the harness exposes (e.g. 'lookup_transaction(date)'). The model orchestrates; the harness executes.",
        banking_example:
          "The model decides it needs the customer's last 30 days of activity; the harness exposes `get_recent_transactions(customer_id)` and returns rows.",
      },
      {
        term: "Retrieval (RAG)",
        definition:
          "Pulling relevant context into the prompt at request time from an external store (vector DB, search index, policy library).",
        banking_example:
          "On every support turn, retrieve the three most relevant paragraphs from the cardholder agreement and inject them into the system prompt.",
      },
      {
        term: "Guardrail",
        definition:
          "A check at the boundary that rejects, rewrites, or escalates a model output that violates policy.",
        banking_example:
          "Refuse to send any reply containing a SSN, bank routing number, or speculative APR claim — even if the model produced it.",
      },
      {
        term: "Human-in-the-loop (HITL)",
        definition:
          "A workflow step where a person reviews the model's draft before it reaches the customer.",
        banking_example:
          "Any dispute over $5,000 gets a human review queue; the model drafts, the agent signs off.",
      },
    ],
    banking_scenario: {
      setup:
        "Your team is building a Tier-1 support agent for the consumer banking app. The agent answers balance questions, finds transactions, explains fees, and escalates anything it isn't sure about.",
      question:
        "Sketch the harness — what does the agent see, what tools does it call, what guardrails fire, and when does it hand off to a human?",
      why_it_matters:
        "Most banks ship 'an AI feature' that is one prompt + a model. The features that actually move CSAT and reduce handle time are systems — and that system is the harness.",
    },
    key_concepts: [
      {
        concept: "Model + harness, not prompt",
        explanation:
          "Stop calling them 'prompt engineering' projects. The artifact is a harness; the prompt is one knob inside it.",
      },
      {
        concept: "Tool-use closes the gap to action",
        explanation:
          "A model that can describe a refund is a demo. A harness that exposes `issue_refund(case_id, amount)` and validates inputs makes it a product.",
      },
      {
        concept: "Retrieval is policy",
        explanation:
          "What the harness retrieves and injects defines what the model can say. Curating that store is a product job, not an infra job.",
      },
      {
        concept: "Observability before scale",
        explanation:
          "If you can't see every harness call — input, tools fired, output, latency, cost, guardrail hits — you can't scale it. Build the dashboard before the rollout.",
      },
    ],
    exercises: [
      {
        id: "ex-3-1",
        title: "Sketch a Tier-1 support harness",
        instructions:
          "Ask Claude to write a short architectural memo describing the harness for the scenario above. Insist on naming: tools exposed, retrieval sources, guardrails, HITL trigger conditions, and the observability minimum.",
        default_system:
          "You are a principal software architect at a US national bank. Write for the head of Consumer Product Engineering. Be concrete about boundaries, failure modes, and what is logged.",
        default_user:
          "Write a 350-word architectural memo for a Tier-1 customer support harness wrapping Claude. Cover: (1) request shape, (2) retrieval sources, (3) tool catalog with brief contracts, (4) guardrails (input + output), (5) HITL trigger conditions, (6) observability minimum. End with one risk you would flag to the CRO.",
        suggested_model: "claude-sonnet-4-6",
        suggested_temperature: 0.3,
        suggested_max_tokens: 1024,
        simulated_response:
          "Memo: Tier-1 Support Harness, v1.\n\nRequest shape — every turn carries: authenticated customer_id, session_id, conversation history (capped 16 turns), user message, locale. The harness rejects unauthenticated calls at the edge.\n\nRetrieval — three sources merged into the system prompt: cardholder agreement (semantic search, top-3 paragraphs), fee schedule (exact lookup by product code), recent FAQ updates (last-30-days search). All sources are versioned and the active version is logged with the request.\n\nTool catalog — `get_balance(customer_id)`, `get_recent_transactions(customer_id, days)`, `search_transactions(customer_id, merchant)`, `create_dispute_case(customer_id, transaction_id, reason)`, `escalate_to_human(case_summary, urgency)`. Each tool returns structured JSON; errors are surfaced to the model with a typed code.\n\nGuardrails — input: PII redaction in logs, length cap 4k chars. Output: regex denylist for SSN/routing-number/account-number patterns, hallucination check against retrieved sources, refusal to quote APR or balance specifics unless they came from a tool call this turn.\n\nHITL — auto-escalate on: dispute amount > $5,000, second escalation in same session, customer use of any of 12 distress keywords, sentiment polarity < -0.7, or model confidence < 0.6.\n\nObservability minimum — every call logs: turn id, model id, retrieved chunk ids and versions, tool calls + arguments + return codes, guardrail hits, full prompt and response under encryption, latency per stage, cost. Dashboards: per-feature pass-rate, escalation rate, p95 latency, daily spend.\n\nRisk to flag — retrieval freshness. If the cardholder agreement updates and re-indexing lags, the harness will confidently cite stale terms. Mitigation: a one-way version pin from agreement → harness deployment, blocking deploys until indices match.",
        leadership_takeaway:
          "When a vendor pitches you an 'AI assistant,' ask to see their harness diagram. Nine out of ten don't have one. The tenth is the one to consider.",
      },
    ],
    self_check: [
      {
        question:
          "Why is 'one prompt + a model' not a product?",
        answer:
          "Because it has no contract with reality: no auth, no retrieval, no tools, no guardrails, no logging, no escalation. The harness is what makes a model accountable for an outcome.",
      },
      {
        question:
          "What is the first thing you build into the harness before any user touches it?",
        answer:
          "Observability. If you can't see what the harness is doing, you can't safely change anything about it. Logging and per-call cost/latency come before the second prompt iteration.",
      },
    ],
    leadership_talking_points: [
      "Reframe every 'AI feature' conversation as a harness conversation; insist on the harness diagram in every spec review.",
      "Treat retrieval sources as policy artifacts — curated, versioned, owned.",
      "Stand up the observability dashboard before the first customer touches the feature; not after.",
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 04 — Context files
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "context-files",
    number: 4,
    title: "Context files",
    subtitle: "Persistent project knowledge that travels with the model",
    summary:
      "A context file (CLAUDE.md, AGENTS.md, .cursorrules, a system prompt library) encodes the things you don't want to repeat every session: who you are, how you write, what's out of bounds, what conventions apply. For a bank, this is where institutional memory and regulatory guardrails live — and a well-written context file is worth more than a hundred re-explanations.",
    vocabulary: [
      {
        term: "Context file",
        definition:
          "A markdown (or similar) file loaded into every model session for a project, encoding conventions, constraints, and procedures.",
        banking_example:
          "Your bank's CLAUDE.md says 'never include customer PII in code samples or logs; always cite the relevant FFIEC handbook section when discussing controls.'",
      },
      {
        term: "System prompt",
        definition:
          "The first message the model sees on every turn, defining role, voice, and rules. Persistent across the conversation.",
        banking_example:
          "Customer-support harness system prompt: 'You are a Tier-1 support agent for Acme Bank. Keep replies under 80 words. Never speculate about pricing.'",
      },
      {
        term: "Precedence",
        definition:
          "When multiple context sources conflict, the order in which one wins. A reliable hierarchy prevents silent overrides.",
        banking_example:
          "Repo CLAUDE.md > org-wide CLAUDE.md > generic developer-personality preferences. Documented and audited.",
      },
      {
        term: "Brief",
        definition:
          "A short, durable project description loaded on session start; tells the model what this project IS without leaking implementation detail.",
        banking_example:
          "Treasury operations brief: 'This repo orchestrates intra-day liquidity moves between three FBO accounts; all amounts in USD; all timestamps NY local.'",
      },
      {
        term: "Memory file",
        definition:
          "An accreted, churning file of facts the model has learned about the user or project. Distinct from the brief (stable) and the policy (rules).",
        banking_example:
          "An ongoing memory of which engineering managers prefer Slack vs email vs Jira for status updates.",
      },
    ],
    banking_scenario: {
      setup:
        "Your bank's developer org has 400 engineers using Claude Code. Some teams are shipping fast, some are repeatedly producing PRs that violate the bank's security baseline (no AWS access keys in code, no PII in logs, no test data with real account numbers).",
      question:
        "Write the org-wide CLAUDE.md that fixes this without strangling the productive teams.",
      why_it_matters:
        "This is the highest-leverage artifact in an enterprise AI rollout. Get it right and 400 engineers move faster AND safer; get it wrong and you've added a layer of friction everybody routes around.",
    },
    key_concepts: [
      {
        concept: "Layered context",
        explanation:
          "Personal > project > organization. Each layer overrides the more general one. Documented precedence is non-negotiable.",
      },
      {
        concept: "Voice + rules + procedures",
        explanation:
          "A good context file has three sections in this order: who I am (voice), what I will and won't do (rules), and how I do common things (procedures). Don't mix them.",
      },
      {
        concept: "Brevity is policy",
        explanation:
          "Long context files train the model to skim them. Keep the top-level file under a screen; push detail behind named references.",
      },
      {
        concept: "Update as a ritual",
        explanation:
          "Treat the context file like a runbook: every meaningful lesson learned updates it. Stale rules erode the model's compliance more than absence of rules.",
      },
    ],
    exercises: [
      {
        id: "ex-4-1",
        title: "Draft an org-wide CLAUDE.md for a bank dev org",
        instructions:
          "Have Claude draft the org-wide CLAUDE.md for the scenario. Insist on the three-section structure, on referencing the bank's existing security baseline by name (not paraphrasing it), and on staying under 600 words.",
        default_system:
          "You are the head of developer experience for a US national bank's engineering organization. You write the documents your engineers actually read. Direct, specific, no fluff.",
        default_user:
          "Draft an org-wide CLAUDE.md for 400 bank engineers using Claude Code. Three sections: (1) Voice & Output, (2) Rules (security baseline, PII, data, secrets, deploy), (3) Procedures (how to handle a flagged finding, how to escalate, how to update this file). Under 600 words. Reference our security baseline as 'SecBase v3' without paraphrasing it.",
        suggested_model: "claude-sonnet-4-6",
        suggested_temperature: 0.3,
        suggested_max_tokens: 1500,
        simulated_response:
          "# CLAUDE.md — Acme Engineering (v1.0)\n\n## 1. Voice & Output\nWrite for an engineer in a hurry. Plain prose. Numbers over adjectives. No emoji. File references as `path/to/file.py:42`. Markdown lists only when the data is genuinely a list. Don't apologize, don't preamble, don't end with 'want me to do more?'\n\n## 2. Rules (non-negotiable)\n- **Security baseline.** All code must conform to SecBase v3, hosted at `internal://secbase/v3`. When in doubt, cite the section number you're applying.\n- **No secrets in code.** Never write AWS keys, database passwords, API tokens, signing keys, or production database URLs into source, tests, or comments. Use the documented secret-fetcher (`acme.secrets.get(...)`).\n- **No real PII in fixtures.** Test data uses the documented faker profile `acme.fixtures.consumer`. Real account numbers, real customer names, real SSNs are never committed, never logged, never echoed back in chat.\n- **No production touches.** Migrations, deletes, mass updates, and IAM changes are operator-driven through the change-management portal. The model proposes; a human approves.\n- **Audit logs are sacred.** Never suggest deleting, truncating, or rewriting audit-table rows. Annotate instead.\n\n## 3. Procedures\n- **Flagged security finding (Snyk, Semgrep, internal scanner).** Don't auto-fix. Read the finding, propose the fix, cite the SecBase section it satisfies, open a PR with the SecBase reference in the description. The scanner re-runs in CI.\n- **Escalation.** If you hit ambiguity that touches customer data, regulatory reporting, or production infra, stop and ask. 'Better to ask once than to ship the wrong thing twice.'\n- **Updating this file.** Lessons learned go in `engineering/learnings/`; quarterly the DX team rolls promoted entries into this file. Don't edit this file directly without DX review.\n\n## 4. Quick reference\n- Code style: `acme-style` (pre-commit auto-formats).\n- PR template: `/.github/pull_request_template.md` (fill every section).\n- Local dev: `make dev`, `make test`, `make lint`. If `make` fails on a fresh clone, file an issue against DX before working around it.\n\n## 5. What this file is for\nThis file gets loaded by every engineer's Claude session. It is the shared floor — not the ceiling. Your team's repo can layer its own CLAUDE.md on top; conflicts resolve in favor of the more specific file.",
        leadership_takeaway:
          "Owning the org-wide CLAUDE.md is the cheapest, highest-leverage senior-product role at a bank that's rolling out AI tooling. Make sure that role is defined and staffed before the rollout, not after the first incident.",
      },
    ],
    self_check: [
      {
        question:
          "Why is a 50-page CLAUDE.md worse than a 1-page one?",
        answer:
          "Models, like humans, skim long documents. The 1-page file gets followed; the 50-page file gets paraphrased into whatever the model remembers, which may not be what you wrote. Push detail behind references.",
      },
      {
        question:
          "How do you keep a context file from going stale?",
        answer:
          "Tie updates to a recurring ritual (sprint retro, monthly DX review) and require lessons learned to flow through a queue that promotes them into the file. No queue, no quality.",
      },
    ],
    leadership_talking_points: [
      "Name an owner of the org-wide CLAUDE.md the same way you name an owner of the build pipeline.",
      "Audit context files quarterly the way you audit IAM policies.",
      "Layer context — personal > project > org — and document the precedence in writing.",
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 05 — Skills
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "skills",
    number: 5,
    title: "Skills",
    subtitle: "Named, callable procedural knowledge — the unit of reuse",
    summary:
      "A 'skill' is a named, self-contained procedure (typically a SKILL.md or similar) that the model invokes when its description matches the task. Skills are how organizations turn one-off prompts into reusable, version-controlled, audit-friendly capabilities. For a bank, skills are the cleanest answer to 'how do we scale AI capability across product lines without re-inventing it every time.'",
    vocabulary: [
      {
        term: "Skill",
        definition:
          "A named procedure, defined in a SKILL.md (or equivalent), that the model invokes when the user's request matches the skill's description.",
        banking_example:
          "A `kyc-decision` skill that walks the customer through know-your-customer evidence collection and emits a structured eligibility decision.",
      },
      {
        term: "Description",
        definition:
          "The one- to three-sentence summary at the top of a skill that the model uses to decide whether to invoke it. The most important sentence in the file.",
        banking_example:
          "'Use this skill whenever the operator submits a dispute over $1000, a chargeback inquiry, or any reference to Reg E.'",
      },
      {
        term: "Procedure",
        definition:
          "The step-by-step body of the skill: inputs required, decision points, outputs emitted.",
        banking_example:
          "Step 1: confirm customer identity. Step 2: pull last 90 days of transactions. Step 3: classify the dispute under Reg E categories. Step 4: emit the case packet.",
      },
      {
        term: "Skill chain",
        definition:
          "Multiple skills invoked in sequence, each consuming the previous skill's output.",
        banking_example:
          "`kyc-decision` → `risk-score` → `account-open` → `welcome-comms` is the new-customer chain.",
      },
      {
        term: "Skill registry",
        definition:
          "The catalog of all skills available in a project or org; the source of truth for what 'the AI can do.'",
        banking_example:
          "Consumer Bank skill registry lists 47 skills as of Q2; product owners review the list quarterly to retire stale ones.",
      },
    ],
    banking_scenario: {
      setup:
        "Your team handles ~12k credit-card disputes per week. Three teams (Phoenix, Tampa, Manila) each have a 200-page playbook describing how to write up a case packet. The playbooks have drifted; the same fact pattern gets different writeups in different sites.",
      question:
        "Design a `dispute-case-packet` skill that becomes the single source of truth for case packet writeups across all three sites.",
      why_it_matters:
        "Skills are how you fix drift. Instead of training three teams against three playbooks, you encode the playbook in one SKILL.md that everyone's harness invokes. The model becomes the consistent floor.",
    },
    key_concepts: [
      {
        concept: "The description is the API",
        explanation:
          "Other humans (and your model) discover a skill through its description sentence. Spend disproportionate time writing it.",
      },
      {
        concept: "Skills are versioned procedures",
        explanation:
          "Treat SKILL.md changes the way you'd treat changes to a documented business process: PR, review, changelog.",
      },
      {
        concept: "One skill, one outcome",
        explanation:
          "Don't write monster skills that do five things. Decompose into named skills and chain them. Composition is the win.",
      },
      {
        concept: "Skills carry destructive-action gates",
        explanation:
          "A skill that touches production or customer data declares its blast radius and requires a covering authorization token before acting. The skill enforces the policy, not the operator's memory.",
      },
    ],
    exercises: [
      {
        id: "ex-5-1",
        title: "Author a `dispute-case-packet` skill",
        instructions:
          "Have Claude draft a complete SKILL.md for the dispute case-packet scenario. Insist on a sharp description, named inputs, numbered procedure steps, named outputs, and an explicit refusal mode when required evidence is missing.",
        default_system:
          "You are a senior product designer at a US national bank, authoring a SKILL.md that will be used by support agents across three sites. Be specific. Treat the description as the most important line. Write the procedure as numbered steps a new hire could follow.",
        default_user:
          "Draft a complete SKILL.md for a `dispute-case-packet` skill. Include: (1) one-paragraph description (the invocation surface), (2) inputs required, (3) numbered procedure (6–10 steps), (4) outputs (named, typed), (5) escalation/refusal conditions, (6) example invocation. Total < 700 words.",
        suggested_model: "claude-sonnet-4-6",
        suggested_temperature: 0.3,
        suggested_max_tokens: 1500,
        simulated_response:
          "# dispute-case-packet\n\n## Description\nUse whenever a customer reports an unauthorized, duplicate, or merchandise-not-received credit-card transaction, or any chargeback inquiry referencing Regulation E or Reg Z. Produces the structured case packet the disputes-investigations team consumes; consolidates the previously-divergent Phoenix/Tampa/Manila playbooks. Invoke even when the customer doesn't use the word 'dispute' if the fact pattern is clearly a dispute.\n\n## Inputs (required)\n- `customer_id` — authenticated session id\n- `transaction_id` — the disputed transaction; if customer references it by date/amount/merchant, resolve to a transaction_id first\n- `customer_statement` — verbatim customer description of the issue\n- `agent_id` — id of the agent recording the case\n\n## Inputs (optional)\n- `prior_case_ids` — any related cases in the last 12 months\n- `evidence_attachments` — receipts, photos, merchant emails\n\n## Procedure\n1. Confirm the customer's identity has been verified this session; if not, halt and surface `identity_unverified`.\n2. Retrieve the transaction record; confirm it is within the 60-day Reg E window. If outside, set `reg_e_eligible=false` and continue (the case still files; the disposition differs).\n3. Classify the dispute into one of: unauthorized, duplicate, merchandise-not-received, merchandise-not-as-described, billing-error, recurring-not-canceled. Use the classification rubric in `docs/dispute-classifications.md`. Confidence threshold 0.8; below that, halt and surface `classification_ambiguous`.\n4. Pull the customer's last 90 days of activity at the merchant; flag patterns (recurring charge, prior successful chargebacks).\n5. Generate the customer-facing acknowledgement (use approved phrasing pool A-C; temperature 0).\n6. Draft the internal case narrative: facts, classification, evidence summary, recommended disposition. Cite the Reg E section that governs.\n7. If dispute amount > $5000 or this is the customer's third dispute this quarter, set `hitl_required=true` and route to senior reviewer queue.\n8. Emit the packet.\n\n## Outputs\n- `case_id` — unique id of the new case\n- `classification` — one of the 6 categories above\n- `reg_e_eligible` — boolean\n- `customer_ack_message` — what was sent to the customer\n- `internal_narrative` — markdown, < 600 words\n- `recommended_disposition` — provisional credit | investigation | denial-with-explanation\n- `hitl_required` — boolean; if true, includes `reviewer_queue` name\n- `evidence_manifest` — list of attached evidence ids with sha256\n\n## Escalation / refusal\nRefuse to issue provisional credit if: (a) identity is unverified, (b) classification confidence < 0.8, (c) prior fraud markers on the account, (d) dispute amount > $25,000 — those route directly to the fraud team.\n\n## Example invocation\nCustomer: 'I see a $42 charge from a gym I canceled six months ago.' → Skill identifies recurring-not-canceled, confirms cancellation was on file, drafts ack + narrative, recommends provisional credit + merchant notification.",
        leadership_takeaway:
          "When you can show your leadership team a printed SKILL.md and say 'this is how all three sites now handle disputes,' you have done more for consistency than a year of training would. Skills convert policy into running code.",
      },
    ],
    self_check: [
      {
        question:
          "Why does a skill's description sentence get more editing attention than the procedure?",
        answer:
          "Because the description is what causes the skill to be invoked at all. A wrong description means a perfect procedure never runs; a great description means the right procedure runs in the right context.",
      },
      {
        question:
          "What happens to your bank's playbook drift problem once a skill exists for the procedure?",
        answer:
          "The skill becomes the single source of truth; sites diverge only by configuration, not by playbook. Training shifts from 'memorize the playbook' to 'know when to invoke the skill.'",
      },
    ],
    leadership_talking_points: [
      "Treat the skill registry as a portfolio: review quarterly, retire stale skills, promote informal patterns into named skills.",
      "Resist 'one skill that does ten things'; insist on composition.",
      "Require destructive-action gates in any skill that touches customer money, identity, or compliance state.",
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 06 — Chaining skills into workflows
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "workflows",
    number: 6,
    title: "Chaining skills into workflows",
    subtitle: "Sequenced, gated, observable — the unit of business value",
    summary:
      "A workflow is a sequenced chain of skills with explicit gates between them. The chain — not any single skill — is what delivers a business outcome end-to-end. For a bank, the workflow is also where compliance lives: each gate is a place a human or rule can intervene before the chain moves to the next step.",
    vocabulary: [
      {
        term: "Workflow",
        definition:
          "A directed sequence of skills (or skill + tool + human) that takes a defined input and produces a defined business output.",
        banking_example:
          "New-account opening: `intake-form` → `kyc-decision` → `risk-score` → `account-create` → `welcome-comms`.",
      },
      {
        term: "Gate",
        definition:
          "A decision point between skills where a rule (or a human) can halt, branch, or override the chain.",
        banking_example:
          "Risk score < 40 → auto-approve. 40–70 → senior reviewer. > 70 → decline with regulatory-mandated language.",
      },
      {
        term: "Artifact handoff",
        definition:
          "The structured object that flows from one skill to the next. Typed, validated, logged.",
        banking_example:
          "The `kyc-decision` skill emits an EligibilityDecision object that `risk-score` consumes as its primary input.",
      },
      {
        term: "Idempotency",
        definition:
          "The workflow can be re-run with the same input and produce the same outcome without duplicating effects (e.g. no double-charging, no duplicate customer record).",
        banking_example:
          "Re-running account-open with the same intake_id surfaces the existing account, not a new one.",
      },
      {
        term: "Compensating action",
        definition:
          "A defined undo for any step that fails or is reversed downstream.",
        banking_example:
          "If account-create succeeds but welcome-comms fails, the workflow re-queues comms; if KYC is later overturned, a separate `account-close` workflow runs.",
      },
    ],
    banking_scenario: {
      setup:
        "Your team is building the new-account opening workflow for the bank's mobile app. Today, four teams own the four steps (intake, KYC, risk, comms). Hand-offs happen via Jira tickets and Slack. End-to-end time is 38 hours median, 6 days p95.",
      question:
        "Design the workflow that compresses median to 90 seconds and p95 to 4 hours, without removing any compliance gate.",
      why_it_matters:
        "This is the kind of metric a product leader stakes a promotion on. The right answer is not 'use AI to go faster' — it is 'sequence the existing skills as one workflow with explicit gates, instrument every handoff, and remove the only-Jira-knows-where-this-is failure mode.'",
    },
    key_concepts: [
      {
        concept: "The workflow IS the product",
        explanation:
          "Customers experience workflows, not skills. Optimize the chain, not just the steps.",
      },
      {
        concept: "Gates are first-class",
        explanation:
          "A workflow without explicit gates is just an opinion. Each gate is a named decision with owners and SLAs.",
      },
      {
        concept: "Observability per stage",
        explanation:
          "Every stage of the chain logs entry, exit, decisions, and outputs. Without this you can't tell where 38 hours went.",
      },
      {
        concept: "Compensation is part of design, not afterthought",
        explanation:
          "Every reversible step needs a defined compensation skill; design them together.",
      },
    ],
    exercises: [
      {
        id: "ex-6-1",
        title: "Design the new-account workflow",
        instructions:
          "Have Claude design the workflow as a numbered chain with explicit gates, named artifacts, SLAs per stage, and named compensation actions. Insist that the gate criteria be quantitative (numbers, not adjectives).",
        default_system:
          "You are a principal product manager at a US national bank designing a workflow that the consumer-banking head will sign off on. Be specific, quantified, and explicit about gates and compensation.",
        default_user:
          "Design the new-account-opening workflow: 5–7 named stages, each with (a) input artifact, (b) output artifact, (c) gate criteria with thresholds, (d) SLA, (e) compensation. End with the top three observability metrics you'd put on the wall.",
        suggested_model: "claude-sonnet-4-6",
        suggested_temperature: 0.3,
        suggested_max_tokens: 1500,
        simulated_response:
          "## New-account workflow v2\n\n1. **intake-form** — in: customer-completed form → out: `IntakeRecord`. Gate: form validation passes (all required fields, plausible values). SLA: 5s. Compensation: persist draft, allow resume.\n\n2. **kyc-decision** — in: `IntakeRecord` → out: `KYCResult{tier, evidence_set, expires_at}`. Gate: tier ∈ {Pass, Conditional, Refer}. SLA: 90s p95. Compensation: revoke evidence-hold if downstream rejects.\n\n3. **risk-score** — in: `IntakeRecord` + `KYCResult` → out: `RiskScore{score 0-100, drivers, model_version}`. Gate: score < 40 → auto-approve path; 40–70 → human-review path; > 70 → decline path. SLA: 5s.\n\n4a. **auto-approve → account-create** — in: above + auto-approve flag → out: `AccountRecord{account_id, opened_at}`. Gate: account creation succeeds, idempotent on `intake_id`. SLA: 10s. Compensation: `account-close-incomplete` if downstream comms fail repeatedly.\n\n4b. **human-review → reviewer-queue** — in: above + review flag → out: reviewer decision in ≤ 4h SLA. Gate: reviewer approves/declines with rationale. Compensation: aged > 4h triggers escalation to lead.\n\n4c. **decline → decline-comms** — in: above + decline flag → out: regulatory-compliant decline letter sent. Gate: language drawn from pre-approved variant pool only. SLA: 1h.\n\n5. **welcome-comms** — in: `AccountRecord` → out: confirmation push + email. Gate: customer reachable on at least one channel. SLA: 60s. Compensation: re-queue every 15min for 1h, then surface to support.\n\n## Observability metrics on the wall\n1. End-to-end p50 / p95 from intake submit to first interaction available.\n2. Per-gate flow rate (% auto-approved, % human-reviewed, % declined) by week, by acquisition channel.\n3. Compensation-fire rate (any compensating action firing means a defect; should trend down).",
        leadership_takeaway:
          "Most of the value in 'AI for new account opening' isn't in the model — it's in the workflow shape. The model is what lets the workflow be possible at sub-minute medians; the workflow is what makes the model usable in production.",
      },
    ],
    self_check: [
      {
        question:
          "Why design compensating actions before you ship the workflow?",
        answer:
          "Because they're the hardest to add after the fact. A workflow with no compensation plan turns every partial failure into an incident. Designing them upfront forces you to think about what 'partial success' means at each stage.",
      },
      {
        question:
          "What's wrong with hand-offs through Jira and Slack between workflow stages?",
        answer:
          "Inconsistency, latency, and lost-in-the-shuffle. Every stage handoff is a defect-generating boundary. Encode the handoff as a typed artifact + logged transition; let the chain run itself.",
      },
    ],
    leadership_talking_points: [
      "Track workflows, not skills, as the unit of business value; report p50/p95 per workflow at QBR.",
      "Treat compensating actions as first-class deliverables — name them, own them, exercise them in drills.",
      "When a partner team asks for AI help, ask which workflow they're trying to compress; if they can't name one, push back.",
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 07 — Automating workflows into routines
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "routines",
    number: 7,
    title: "Automating workflows into routines",
    subtitle: "Cron, hooks, triggers — when a workflow runs without a human asking",
    summary:
      "A routine is a workflow that runs on a schedule or in response to an event, without a human invoking it each time. Routines convert one-off productivity gains into ambient capability. For a bank, this is how the model graduates from 'helpful assistant when invoked' to 'continuous control surface.'",
    vocabulary: [
      {
        term: "Routine",
        definition:
          "A scheduled or event-triggered workflow that runs autonomously.",
        banking_example:
          "Nightly fraud-pattern roll-up: every weekday 02:00 local, aggregate the day's high-risk transactions and email the fraud lead a one-page summary.",
      },
      {
        term: "Hook",
        definition:
          "An event-trigger pattern: when X happens, run Y. The 'X' might be a code commit, a customer signup, a regulatory filing, a calendar event.",
        banking_example:
          "On every new branch in the lending repo, run a code-review hook that posts findings as a draft PR comment.",
      },
      {
        term: "Schedule (cron)",
        definition:
          "A time-based trigger — minutes, hours, days, business-day-only patterns.",
        banking_example:
          "Every Monday 07:00 ET, build the weekly customer-feedback consolidation and post to the consumer-product channel.",
      },
      {
        term: "Idle/wakeup pattern",
        definition:
          "A routine that sleeps until a condition is met (file appears, ticket transitions, balance threshold crossed) then runs.",
        banking_example:
          "Wake up when the disputes queue exceeds 200 items; run the triage-prioritization workflow and notify the queue owner.",
      },
      {
        term: "Routine ownership",
        definition:
          "Every routine has a named owner accountable for what it does, what it costs, and when it's retired.",
        banking_example:
          "The 'nightly fraud roll-up' routine is owned by the fraud product manager; reviewed quarterly.",
      },
    ],
    banking_scenario: {
      setup:
        "Your fraud team currently produces a Monday morning 'last week's anomalies' deck by hand — about 6 hours of work for the analyst, every week. Quality is high but cadence is slow; by Monday afternoon, the data is 4 days stale.",
      question:
        "Design the routine that replaces the manual deck without losing the analyst's edge cases.",
      why_it_matters:
        "Routines are where AI repays itself. A 6-hour weekly task becoming an automated 4-minute report frees the analyst to do the work the deck only described.",
    },
    key_concepts: [
      {
        concept: "Automate the seam, not the judgment",
        explanation:
          "Routines should run the mechanical assembly; humans keep the judgment on top. The right output of a routine is a draft, not a decision.",
      },
      {
        concept: "Schedule with the customer in mind",
        explanation:
          "A routine that emails the fraud lead at 02:00 is hostile. Land the artifact at 07:00 local; let the routine run earlier.",
      },
      {
        concept: "Cost belongs in the routine spec",
        explanation:
          "A routine that quietly costs $400/month adds up. Track per-routine cost the same way you track per-feature cost.",
      },
      {
        concept: "Sunset clause",
        explanation:
          "Every routine has a planned retirement date. If it's still valuable, re-affirm; if not, kill it. Routines accrete; left alone they become invisible cost.",
      },
    ],
    exercises: [
      {
        id: "ex-7-1",
        title: "Spec the routine that replaces the fraud-anomalies deck",
        instructions:
          "Have Claude write the routine spec: schedule, inputs, workflow steps, output artifact, distribution, ownership, cost budget, sunset date.",
        default_system:
          "You are a senior product manager at a US national bank, writing a one-page routine specification that your CTO will approve.",
        default_user:
          "Write the routine spec to replace the weekly hand-built fraud-anomalies deck. Cover: (1) schedule, (2) trigger conditions, (3) inputs and sources, (4) workflow steps with named skills, (5) output artifact format and distribution, (6) human checkpoints, (7) named owner, (8) monthly cost budget with justification, (9) sunset/review date.",
        suggested_model: "claude-sonnet-4-6",
        suggested_temperature: 0.3,
        suggested_max_tokens: 1500,
        simulated_response:
          "## Routine: weekly-fraud-anomalies\n\n**Schedule.** Every Monday 06:30 ET (lands in inbox by 07:00). Skips US bank holidays.\n\n**Trigger.** Cron + a guard: if fraud-data warehouse last-update is more than 36 hours stale, post a degraded notice instead of running.\n\n**Inputs.** (1) last 7 days of transaction-level fraud-flag stream, (2) prior week's deck for diff context, (3) the 12 open investigations in the case-management system, (4) any alerts the model emitted during the week.\n\n**Workflow.** `pull-fraud-data` → `cluster-anomalies` → `compare-to-prior-week` → `cross-reference-open-cases` → `draft-summary-deck` → `flag-edge-cases-for-human`.\n\n**Output.** Markdown brief + 1-slide-per-cluster deck. Sections: top-5 anomaly clusters, week-over-week change, three edge cases the model is unsure about, one recommended action per cluster.\n\n**Distribution.** Email to the fraud product manager, the fraud ops lead, and the consumer banking head. Posted to #fraud-weekly Slack channel.\n\n**Human checkpoints.** Edge-cases-flagged-for-human section is reviewed by the on-call fraud analyst before the deck goes wider. If the analyst overrides a model conclusion, the override is recorded back into the eval set.\n\n**Owner.** Fraud product manager. Backup: fraud ops lead.\n\n**Cost budget.** $180/month (≈ $9/run × 20 runs/year cluster work + small drafting overhead). Reviewed monthly; alert at 130% of budget.\n\n**Sunset/review.** First review at +90 days. If override rate < 5% and analyst time saved confirmed, extend 12 months. Hard sunset at 24 months absent re-spec.",
        leadership_takeaway:
          "Two questions reveal the maturity of an org's AI program: how many routines do you have, and who owns each one. If the answer is 'a lot' and 'nobody,' you have a control problem, not an AI problem.",
      },
    ],
    self_check: [
      {
        question:
          "Why does a routine need a sunset date?",
        answer:
          "Because routines accrete invisible cost — model calls, oncall responsibility, mental load. A sunset date forces a re-justification; absent that, every routine lives forever.",
      },
      {
        question:
          "What's the right product owner instinct when a stakeholder asks for 'just a small automation'?",
        answer:
          "Ask for the spec: schedule, owner, output, cost, sunset. If those five questions can't be answered, the right answer is not yet.",
      },
    ],
    leadership_talking_points: [
      "Maintain a routine registry alongside the skill registry; review quarterly.",
      "Require every routine to declare cost and sunset before launch.",
      "Always keep a human checkpoint between the routine's draft and any irreversible action.",
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 08 — Consolidating results
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "consolidation",
    number: 8,
    title: "Consolidating results",
    subtitle: "Aggregating many AI runs into a single trustworthy artifact",
    summary:
      "When a workflow runs at scale, you end up with hundreds or thousands of model outputs that nobody has time to read. Consolidation is the deliberate act of rolling those outputs into one artifact a human can actually act on. Done well, it's where the AI investment turns into executive insight.",
    vocabulary: [
      {
        term: "Aggregation",
        definition:
          "Combining outputs across runs/sources into a single view; not just stacking, but reducing.",
        banking_example:
          "1,200 weekly support transcripts → one 8-bullet 'top themes' brief.",
      },
      {
        term: "Deduplication",
        definition:
          "Detecting and merging substantially identical outputs that came from different runs/sources.",
        banking_example:
          "Three branches all flagged the same vendor outage; the consolidation surfaces it once with three citations.",
      },
      {
        term: "Hierarchy of summarization",
        definition:
          "Multiple length tiers (one-line, paragraph, page) of the same underlying material — different audiences read different tiers.",
        banking_example:
          "One-line for the dashboard, paragraph for the team channel, page for the QBR deck.",
      },
      {
        term: "Provenance",
        definition:
          "For every line in the consolidated artifact, a back-reference to the source it came from.",
        banking_example:
          "Every bullet in the executive brief links to the underlying transcripts so the head of ops can drill in.",
      },
      {
        term: "Confidence labeling",
        definition:
          "Marking each consolidated finding with the strength of underlying evidence (high/medium/low; or quantified).",
        banking_example:
          "'Customer frustration with disputes flow is HIGH (47 mentions across 4 channels)' vs 'Possible emerging issue with the rewards screen on Android (3 mentions, LOW)'.",
      },
    ],
    banking_scenario: {
      setup:
        "Your consumer banking app gets feedback through 6 channels: app-store reviews, in-app NPS, support tickets, Reddit, Twitter, branch escalation emails. The product team currently reads ~50 items each per week and 'gets a feel' for issues.",
      question:
        "Design the consolidation workflow that produces one weekly 'voice-of-customer' brief that the team trusts more than their own skim — without losing edge signal.",
      why_it_matters:
        "Bad consolidation hides the new signal in the average. Good consolidation surfaces it. The discipline is what turns a flood of model outputs into a strategic instrument.",
    },
    key_concepts: [
      {
        concept: "Reduce in tiers",
        explanation:
          "Don't summarize 6,000 items in one shot. Cluster first, summarize per cluster, then summarize across clusters. Each tier is auditable.",
      },
      {
        concept: "Preserve outliers explicitly",
        explanation:
          "Always carry an 'unusual signals' section that lists items that didn't fit any cluster. New problems live there.",
      },
      {
        concept: "Every line cites",
        explanation:
          "Every consolidated bullet links back to source items. If a reader can't drill in, you haven't built trust; you've built a wall.",
      },
      {
        concept: "Confidence-label everything",
        explanation:
          "A bullet from 200 sources reads differently from a bullet from 3. Make the difference visible in the artifact.",
      },
    ],
    exercises: [
      {
        id: "ex-8-1",
        title: "Spec the weekly voice-of-customer consolidation",
        instructions:
          "Have Claude spec the consolidation routine end-to-end. Insist on tiered reduction, outlier preservation, citations, confidence labeling, and the format of the final brief.",
        default_system:
          "You are a senior product manager at a US national bank, designing a consolidation routine the consumer-product head will read every Monday.",
        default_user:
          "Spec the weekly voice-of-customer consolidation routine. Cover: (1) sources and pull cadence, (2) per-source preprocessing, (3) tiered reduction (cluster, per-cluster summary, cross-cluster summary), (4) outlier preservation, (5) citation strategy, (6) confidence labeling rubric, (7) final brief format, (8) recipient list and engagement metric.",
        suggested_model: "claude-sonnet-4-6",
        suggested_temperature: 0.3,
        suggested_max_tokens: 1500,
        simulated_response:
          "## weekly-voc-consolidation\n\n**Sources.** App Store + Google Play (daily pull), in-app NPS verbatims (continuous), Zendesk support tickets (continuous), public Reddit /r/personalfinance and /r/banking (daily search), public Twitter mentions (daily search), branch-escalation email inbox (continuous).\n\n**Per-source preprocessing.** Strip boilerplate, normalize whitespace, detach PII (Presidio + custom bank-name pattern). Tag each item with `{source, dt, channel, sentiment_polarity, region_inferred}`.\n\n**Tier 1 — cluster.** Embed all items from the week; HDBSCAN cluster; assign each cluster a topic label via Claude (temperature 0). Cluster size threshold 5; below threshold → outlier bucket.\n\n**Tier 2 — per-cluster summary.** For each cluster: representative quote, problem statement, sentiment trend WoW, top affected user segments. Always cite the cluster item ids.\n\n**Tier 3 — cross-cluster summary.** Rank clusters by (size × severity × WoW delta). Top 5 → main body. Remaining → appendix.\n\n**Outlier preservation.** Outlier-bucket items (below cluster threshold) get a dedicated 'unusual signals' section. The on-call PM is asked to review each before the brief ships.\n\n**Citation strategy.** Every bullet links to the cluster id (which links to the underlying item ids). Reader can drill from sentence to original transcript in two clicks.\n\n**Confidence rubric.** HIGH ≥ 50 items × ≥ 3 sources. MEDIUM ≥ 15 items × ≥ 2 sources. LOW < 15 items or single source. Label appears on every bullet.\n\n**Final brief format.** One-line headline (for dashboard), 8-bullet executive summary (for team channel), 2-page main brief (for the consumer-product head), full appendix (for analysts).\n\n**Recipients.** Consumer product head (push), consumer product directors (push), product analytics channel (post), PM rotation (digest).\n\n**Engagement metric.** Weekly open rate + at-least-one-drill-in rate; if drill-in rate < 40% for 2 consecutive weeks, the brief format is reviewed.",
        leadership_takeaway:
          "The point of consolidation is not the brief — it's the trust that lets the team act on the brief without re-reading the underlying data. Earn that trust through citations and confidence labels; the team will keep coming back.",
      },
    ],
    self_check: [
      {
        question:
          "Why is the 'unusual signals' / outlier section non-negotiable in a consolidation?",
        answer:
          "Because consolidations naturally suppress what doesn't fit — and the highest-value insight is often exactly what doesn't fit yet. Preserving outliers is how you find tomorrow's cluster before it forms.",
      },
      {
        question:
          "What's the failure mode when every bullet in the brief doesn't carry a citation?",
        answer:
          "Trust erodes: the first time a reader can't verify a claim, the whole brief becomes optional reading. Citations are how a consolidated artifact earns its place in the workflow.",
      },
    ],
    leadership_talking_points: [
      "Every consolidation ships with citations + confidence labels — or it doesn't ship.",
      "Track engagement (open rate, drill-in rate) on every consolidated artifact; consolidations decay if not refined.",
      "Always preserve an outliers section; the new signal is usually below the cluster threshold.",
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 09 — Extracting results
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "extraction",
    number: 9,
    title: "Extracting results",
    subtitle: "Pulling structured data out of unstructured AI outputs (or documents)",
    summary:
      "Extraction is the discipline of getting reliable, typed data out of the model's free-form prose — names, amounts, dates, classifications, decisions. Done badly, it's brittle regex over hallucinated text; done well, it's a JSON contract the model fulfills under structured-output mode. For a bank, extraction is what makes AI legible to the systems of record.",
    vocabulary: [
      {
        term: "Structured output",
        definition:
          "The model is asked to emit a typed JSON object matching a declared schema; the harness validates it.",
        banking_example:
          "Loan-application narrative → `{applicant_name, income, debt, employment_status, decision_factors[]}` as JSON.",
      },
      {
        term: "JSON schema",
        definition:
          "Formal definition of the shape, types, and constraints of the expected output. The contract between model and harness.",
        banking_example:
          "`{income: number, debt: number, decision_factors: string[5..10]}` constrains the model to between 5 and 10 factors.",
      },
      {
        term: "Citation extraction",
        definition:
          "Pulling not just the value but the source span (page + character offsets) that the value came from.",
        banking_example:
          "Extracted `total_assets: $1.2M` carries `source: 'Schedule A, page 4, lines 12–14'`.",
      },
      {
        term: "Validator chain",
        definition:
          "Multiple validations applied in sequence: schema validity, business rules, cross-field consistency.",
        banking_example:
          "Income > 0, debt ≥ 0, dti = debt/income, application date not in the future.",
      },
      {
        term: "Refusal-on-uncertainty",
        definition:
          "When the model can't extract a field with sufficient confidence, it emits null + reason rather than fabricating.",
        banking_example:
          "If the income line is illegible, return `income: null, income_reason: 'illegible scan'` — not a guess.",
      },
    ],
    banking_scenario: {
      setup:
        "Your mortgage-origination team receives ~800 loan application packets per week as PDF scans of varying quality. Today, two analysts spend 15 minutes per packet re-keying fields into the loan-origination system. You want to extract structured data with AI.",
      question:
        "Design the extraction pipeline that gets it right enough to remove the re-keying step — and identifies the cases where the model should refuse and route to a human.",
      why_it_matters:
        "Extraction is where AI investments either obviously pay off or obviously fail. The bar is not 'better than nothing' — it's 'reliable enough to remove a human step.' That bar is met by validators and refusals, not by a cleverer prompt.",
    },
    key_concepts: [
      {
        concept: "Schema before prompt",
        explanation:
          "Always define the JSON schema before you write the prompt. The schema is the contract; the prompt is just one way to fulfill it.",
      },
      {
        concept: "Validate, don't trust",
        explanation:
          "Every extracted field passes through schema validation + business rules. Anything failing validation routes to human review with the failure reason attached.",
      },
      {
        concept: "Citations are evidence",
        explanation:
          "An extracted value without a source citation is unaccountable. Require citations for every field whose value will land in a system of record.",
      },
      {
        concept: "Refusal is a feature",
        explanation:
          "A model that returns null with a stated reason is more useful than one that guesses. Engineer the prompt to refuse; reward the harness for routing refusals to humans.",
      },
    ],
    exercises: [
      {
        id: "ex-9-1",
        title: "Design the loan-application extraction contract",
        instructions:
          "Have Claude write the JSON schema for loan-application extraction, the prompt that produces it, the validator chain, and the refusal contract. Then ask for a worked example using a fake illegible-income packet.",
        default_system:
          "You are a senior product manager at a US national bank, designing an extraction contract the underwriting head will sign off on. Be specific about types, constraints, validators, and refusal behavior.",
        default_user:
          "Design the loan-application extraction pipeline. Provide: (1) the JSON schema with types and constraints, (2) the system prompt for the extractor (terse, contract-style), (3) the validator chain (schema + business rules + cross-field), (4) the refusal contract (when null is returned, what reason is attached). Then show one worked example output for a packet where the income line is partially illegible.",
        suggested_model: "claude-sonnet-4-6",
        suggested_temperature: 0.0,
        suggested_max_tokens: 2048,
        simulated_response:
          "## Schema (LoanApplicationExtract v1)\n```json\n{\n  \"applicant_name\": \"string\",\n  \"ssn_last_4\": \"string (4 digits) | null\",\n  \"dob\": \"date | null\",\n  \"employment_status\": \"enum: employed | self_employed | retired | unemployed | other | null\",\n  \"annual_income\": \"number (≥0) | null\",\n  \"annual_income_source\": \"enum: W2 | 1099 | tax_return | bank_statement | self_reported | null\",\n  \"total_debt\": \"number (≥0) | null\",\n  \"requested_loan_amount\": \"number (>0)\",\n  \"loan_purpose\": \"enum: purchase | refinance | cash_out | other\",\n  \"property_value_estimate\": \"number (>0) | null\",\n  \"citations\": {\n    \"<field_name>\": {\"page\": \"int\", \"offsets\": [\"int\", \"int\"], \"snippet\": \"string\"}\n  },\n  \"refusals\": {\n    \"<field_name>\": \"string (reason)\"\n  }\n}\n```\n\n## System prompt (extractor)\n'You extract fields from US residential loan-application packets into the LoanApplicationExtract v1 schema. Return ONLY valid JSON. For any field you cannot extract with high confidence, set it to null AND add an entry to `refusals` with a one-sentence reason. Always populate `citations` for every non-null field with page, character offsets, and a snippet. Do not infer values from context; only extract from the packet text.'\n\n## Validator chain\n1. JSON schema validity (types, enums, constraints).\n2. Business rules: `requested_loan_amount > 0`, `annual_income ≥ 0` if not null, `dob` between 1900-01-01 and today-18yrs.\n3. Cross-field: if `loan_purpose == purchase`, `property_value_estimate` must be non-null. If `employment_status == retired`, `annual_income_source` ∈ {1099, tax_return, bank_statement}.\n4. Citation-presence: every non-null field has a citation entry.\n\n## Refusal contract\nA refusal returns the field as `null` and adds `refusals[field] = reason`. The harness routes any packet with ≥ 1 refusal in {annual_income, total_debt, requested_loan_amount} to human review with the reasons attached. Refusals in other fields are surfaced as warnings; the packet still flows.\n\n## Worked example (illegible income)\n```json\n{\n  \"applicant_name\": \"Maria Gutierrez\",\n  \"ssn_last_4\": \"4421\",\n  \"dob\": \"1984-07-12\",\n  \"employment_status\": \"employed\",\n  \"annual_income\": null,\n  \"annual_income_source\": \"W2\",\n  \"total_debt\": 38400,\n  \"requested_loan_amount\": 480000,\n  \"loan_purpose\": \"purchase\",\n  \"property_value_estimate\": 612000,\n  \"citations\": {\n    \"applicant_name\": {\"page\": 1, \"offsets\": [120, 138], \"snippet\": \"Maria Gutierrez\"},\n    \"total_debt\": {\"page\": 3, \"offsets\": [842, 856], \"snippet\": \"$38,400 total\"}\n  },\n  \"refusals\": {\n    \"annual_income\": \"W2 income line illegible due to scan artifact on page 2; visible digits are '$_,400' but tens-of-thousands position is obscured.\"\n  }\n}\n```\nHarness routes to human review.",
        leadership_takeaway:
          "When a vendor claims '95% extraction accuracy,' ask whether the other 5% is silently wrong or loudly refused. Loudly refused is a feature; silently wrong is a liability. Design for the second mode out of the gate.",
      },
    ],
    self_check: [
      {
        question:
          "Why design the schema before writing the prompt?",
        answer:
          "Because the schema is the contract the downstream system depends on; the prompt is one of several ways to fulfill it. If you write the prompt first, you'll back-fit a schema to whatever the prompt happens to produce, and the contract drifts.",
      },
      {
        question:
          "How does engineered refusal change the product story?",
        answer:
          "It transforms 'AI guesses' into 'AI tells us when it doesn't know.' That single distinction is what makes extraction shippable into a regulated workflow.",
      },
    ],
    leadership_talking_points: [
      "Schemas are first-class deliverables; review them with downstream system owners before any prompt work begins.",
      "Track refusal rate per extraction surface; flat or rising refusal is healthy, falling refusal without a model change is suspicious.",
      "Citations on every extracted field that lands in a system of record — non-negotiable for audit.",
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10 — Summarizing results
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "summarization",
    number: 10,
    title: "Summarizing results",
    subtitle: "Length tiers and faithfulness — the discipline of distillation",
    summary:
      "Summarization is deceptively simple — every PM has run 'summarize this PDF' once. The discipline is shipping it: defining the length tiers, preserving citations, measuring faithfulness, and detecting drift over time. For a bank, summarization touches everything from Fed minutes to QBR decks to customer disclosures.",
    vocabulary: [
      {
        term: "Length tier",
        definition:
          "A target output length, declared explicitly: one-line, three-bullet, paragraph, one-page, deck.",
        banking_example:
          "Fed FOMC minutes: one-line (for the rates desk dashboard), three-bullet (for the morning call), one-page memo (for the head of trading).",
      },
      {
        term: "Faithfulness",
        definition:
          "Whether every claim in the summary is supported by the source. Measurable: count unsupported claims per summary.",
        banking_example:
          "A 1-page memo from the Fed minutes contains 0 unsupported claims; if it cites a vote count, that vote count is in the source.",
      },
      {
        term: "Compression ratio",
        definition:
          "Source length / summary length. High ratios magnify both signal and risk of omission.",
        banking_example:
          "50-page minutes → 1-page memo: 50x compression. Above ~30x, expect to lose nuance — make the omissions explicit.",
      },
      {
        term: "Style adapter",
        definition:
          "A consistent voice/format layer applied to summaries so different sources read consistently in their downstream channel.",
        banking_example:
          "All trading-desk memos open with 'Bottom line:' followed by 1 sentence — across Fed minutes, ECB minutes, BOE minutes.",
      },
      {
        term: "Drift detection",
        definition:
          "Tracking whether summary quality changes over time (model updates, source format changes); flagging when it does.",
        banking_example:
          "Weekly faithfulness eval on a held-out source pack; alert if pass-rate drops > 2 points.",
      },
    ],
    banking_scenario: {
      setup:
        "Your bank's rates desk consumes ~40 central-bank documents per month (Fed/ECB/BOE/BOJ/PBoC). Today, a junior analyst writes 1-page memos overnight; quality is good but the 6am cutoff is brutal and burns out the role.",
      question:
        "Spec the summarization service that produces the 1-page memo across all five central banks consistently, with faithfulness measurement, length-tier outputs, and drift alerts.",
      why_it_matters:
        "Summarization at scale is where AI promises run into reality. Get faithfulness wrong once on a vote count or rate guidance and the rates desk loses trust forever. Get it right and you've quietly upgraded an entire workflow.",
    },
    key_concepts: [
      {
        concept: "Declare the tier",
        explanation:
          "Always specify the target length explicitly. 'Summarize' is a request; 'produce a 120-word three-bullet summary' is a contract.",
      },
      {
        concept: "Faithfulness is the only metric that matters",
        explanation:
          "Length, fluency, even readability are downstream of faithfulness. If the summary contains an unsupported claim, nothing else saves it.",
      },
      {
        concept: "Style adapters earn trust",
        explanation:
          "Consistent format across sources lets readers internalize the structure; reduces cognitive load; increases adoption.",
      },
      {
        concept: "Drift is inevitable; detection is the answer",
        explanation:
          "Models update, source formats shift, news cycles change. A held-out eval set + a weekly diff is the only durable defense.",
      },
    ],
    exercises: [
      {
        id: "ex-10-1",
        title: "Spec the central-bank-document summarizer",
        instructions:
          "Have Claude spec the summarizer: length tiers, style adapter, faithfulness measurement, drift alert. End with the first three lines of a worked memo from Fed minutes.",
        default_system:
          "You are a senior product manager at a US national bank, designing a summarization service the rates-desk head will sign off on.",
        default_user:
          "Spec the central-bank-document summarizer. Cover: (1) supported sources, (2) length tiers with word budgets, (3) style adapter (open/close conventions), (4) faithfulness measurement (held-out eval + scoring), (5) drift alert (trigger + recipients), (6) failure mode + human fallback. End with a worked 3-sentence opening of a 1-page memo derived from a Fed FOMC minutes release.",
        suggested_model: "claude-sonnet-4-6",
        suggested_temperature: 0.2,
        suggested_max_tokens: 1500,
        simulated_response:
          "## central-bank-summarizer v1\n\n**Sources.** Fed FOMC minutes + statement, ECB monetary policy account + statement, BoE MPC minutes + summary, BoJ outlook report + statement, PBoC quarterly monetary report.\n\n**Length tiers.** (1) dashboard one-liner (≤ 25 words), (2) morning-call three-bullet (≤ 90 words), (3) rates-desk 1-page memo (550–650 words).\n\n**Style adapter.** Every output starts with 'Bottom line:' followed by 1 sentence with the action-relevant call. Memos close with a 'What changed vs prior meeting' 3-bullet section.\n\n**Faithfulness measurement.** Held-out eval: 30 historical (source, gold memo) pairs. Each run: (a) automated faithfulness check (every claim in summary verified against source by a second model call), (b) weekly human spot-check of 3 randomly sampled memos by the desk analyst. Track unsupported-claim rate; target = 0.\n\n**Drift alert.** If automated unsupported-claim rate > 2% in any rolling 5-memo window OR human spot-check disagrees on > 1 of 3, alert the rates-desk head + product owner via push + Slack. The service marks subsequent memos with a 'DRIFT WATCH' banner until eval passes again.\n\n**Failure mode + human fallback.** If the summarizer cannot extract enough from a source to fill the memo within faithfulness constraints, it produces a degraded memo flagged 'partial — desk to fill' and pings the on-call analyst.\n\n**Worked opening.** 'Bottom line: The Committee left the policy rate unchanged at 4.25–4.50% and softened forward language on additional tightening; the bar for further hikes appears higher than at the prior meeting. Participants saw recent inflation data as evidence that disinflation is broadening, though several flagged shelter and services as the remaining drivers. The minutes added new language acknowledging two-sided risks to the outlook — the first such balance since 2023…'",
        leadership_takeaway:
          "Most summarization features fail not on quality but on trust. Faithfulness measurement, drift alerts, and a public-to-the-team eval set are how you keep trust through model updates and source-format changes. Build them on day one.",
      },
    ],
    self_check: [
      {
        question:
          "Why is faithfulness a more important metric than fluency or length adherence?",
        answer:
          "Because a summary with one fabricated claim destroys reader trust irrespective of how fluent or correctly-sized it is. Fluency degrades the experience; faithlessness destroys it.",
      },
      {
        question:
          "What does 'drift watch' do for the product even when nothing has drifted?",
        answer:
          "It makes the eval visible; readers know the team is watching. Trust survives model updates because the eval, not the model, is the contract.",
      },
    ],
    leadership_talking_points: [
      "Declare the length tier on every summarization surface; 'summarize this' is not a spec.",
      "Faithfulness measurement is non-negotiable for any summary read by a customer or used for a decision.",
      "Maintain a held-out eval set on every summarization service; review pass-rate weekly.",
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11 — Leadership guidance to a product team
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "leadership",
    number: 11,
    title: "Leadership guidance to a product team",
    subtitle: "Translating AI capability into roadmap, policy, hiring, and vendor selection",
    summary:
      "Everything in this app is preparation for this module. A senior product designer leading AI in a bank is not the smartest prompt engineer in the room — she is the person who can take the team from 'we tried Claude' to 'here is our product strategy, here is what we will and won't ship, here is who we will hire and what we will buy.' That work is taught nowhere; it is mostly modeled. This module gives you the artifacts.",
    vocabulary: [
      {
        term: "Capability/risk frontier",
        definition:
          "A 2x2 (or simpler) framing that maps candidate AI features by capability lift vs incremental risk. The artifact that disciplines a roadmap.",
        banking_example:
          "X-axis: customer-perceived lift. Y-axis: incremental compliance/reputation risk. Features in the upper-right ship only with explicit risk acceptance.",
      },
      {
        term: "Build/buy/partner triage",
        definition:
          "A discipline applied to every AI capability: do we build it on top of a foundation model, buy a vertical product, or partner with a vendor under our governance.",
        banking_example:
          "Build the support harness on Claude; buy the document-OCR vendor; partner with the fraud-graph startup under a vendor risk-management exception.",
      },
      {
        term: "AI policy",
        definition:
          "The written, governance-signed policy that defines what AI features are allowed where, what controls apply, who owns oversight.",
        banking_example:
          "AI policy v2: AI may draft customer-facing copy in approved templates only; AI may not autonomously price credit; AI must log every customer-impacting decision.",
      },
      {
        term: "Capability hiring profile",
        definition:
          "The roles you need to hire (or upskill) to deliver the AI roadmap; distinct from generic data-science hiring.",
        banking_example:
          "AI product manager, AI harness engineer, AI eval engineer, AI risk/governance partner. Four distinct profiles, not one.",
      },
      {
        term: "Vendor risk model for AI",
        definition:
          "An adapted vendor-risk framework that handles model providers, agent-platform vendors, and embedded-AI features in SaaS tools.",
        banking_example:
          "Every AI vendor declares: training data lineage, model update cadence, audit logging, ability to operate in our cloud account, deletion contract.",
      },
    ],
    banking_scenario: {
      setup:
        "Your new VP of Consumer Banking has asked you for a one-pager: 'What should our AI product strategy be for the next 18 months? Include what we will ship, what we won't, what we'll hire, and what we'll buy.' Due Friday.",
      question:
        "Draft the one-pager — and bring with you the artifacts that will make this conversation easy.",
      why_it_matters:
        "This is the interview question, the promotion conversation, and the day-one assignment in your next role. Mastery here is what differentiates 'someone who uses AI' from 'someone who leads with AI.' This module gives you a complete artifact set you can adapt.",
    },
    key_concepts: [
      {
        concept: "Lead with a frontier, not a list",
        explanation:
          "Lists of features get litigated; frontiers get adopted. Frame the strategy as 'where we sit on the capability/risk frontier' and place each candidate feature on it.",
      },
      {
        concept: "Name the won'ts explicitly",
        explanation:
          "Half the value of an AI strategy is the public commitment to NOT do certain things (autonomous pricing, opaque deny decisions, training on customer data without consent). The won'ts buy you cover to do the wills.",
      },
      {
        concept: "Tie hiring to capabilities, not headcount",
        explanation:
          "Map each must-ship feature to the named roles required (PM, harness eng, eval eng, governance). Ask for those roles, not 'four AI engineers.'",
      },
      {
        concept: "Build/buy/partner with a public scorecard",
        explanation:
          "Run every AI vendor decision through the same scorecard — vendor risk model + cost envelope + capability fit. Decisions become defensible; politics decline.",
      },
    ],
    exercises: [
      {
        id: "ex-11-1",
        title: "Draft the one-pager",
        instructions:
          "Have Claude draft the one-pager for the VP. Insist on the capability/risk frontier framing, named will-ship and won't-ship lists, named hiring profile, and named vendor triage outcomes for two example capabilities.",
        default_system:
          "You are a senior product designer at a US national bank, preparing a one-page AI strategy memo for your new VP of Consumer Banking. Write with crisp authority. Numbers and named decisions; no fluff.",
        default_user:
          "Draft the one-pager. Sections: (1) Where we sit on the capability/risk frontier (2 sentences), (2) Three things we WILL ship in the next 18 months (with rationale), (3) Three things we explicitly WILL NOT ship (with rationale), (4) Hiring profile (named roles + count), (5) Build/buy/partner triage for two example capabilities (document-OCR; conversational support), (6) The single artifact you'd ask the VP to approve to make all of this real.",
        suggested_model: "claude-opus-4-7",
        suggested_temperature: 0.4,
        suggested_max_tokens: 2000,
        simulated_response:
          "# AI strategy for Consumer Banking — 18 months\n\n**Where we sit.** Frontier-model capability has crossed the threshold where customer-facing drafting, structured extraction, and triage are reliably above human-floor on bounded surfaces. Compliance and reputational risk on autonomous decisioning have not crossed that threshold and probably won't this cycle.\n\n**We will ship.**\n1. Tier-1 support harness (Claude-drafted replies, human-approve for any action). Target: -35% handle time, no change to first-contact resolution. Owner: Support PM.\n2. Loan-application packet extraction (replaces re-keying step; refuses to humans). Target: 70% straight-through-extracted, 0 silent-mis-key incidents. Owner: Origination PM.\n3. Voice-of-customer consolidation routine (weekly brief replacing manual roll-ups). Target: 70% read rate among product directors. Owner: Insights PM.\n\n**We will NOT ship.**\n1. Autonomous credit decisioning. Model may inform; human always decides. (Reason: regulatory clarity + reputational asymmetry.)\n2. AI-generated marketing copy that goes live without human review. (Reason: brand-tone drift risk; one viral miss costs more than the productivity gain.)\n3. Model training on customer transaction data without opt-in. (Reason: trust posture; not worth the upside.)\n\n**Hiring profile.** 1 AI Product Lead, 2 AI Harness Engineers, 1 AI Eval Engineer, 1 AI Governance Partner (dotted-line to Risk). Five FTEs; not 'a team of AI engineers.'\n\n**Build/buy/partner.**\n- Document-OCR: BUY a vertical vendor (faster to scale, governance already mapped). Reassess in 12 months.\n- Conversational support: BUILD on Claude under our own harness (our customers, our policy, our logs). Vendor platforms force opaque retention/training contracts we won't sign.\n\n**Approve this.** I'm asking for a signed AI Policy v2 (one page). It defines the won'ts above and creates the AI Governance Partner role. With it, every shipped feature becomes a clean go/no-go; without it, every feature becomes its own debate.",
        leadership_takeaway:
          "When you walk into your next role, walk in with this one-pager already drafted for whatever bank you'll be at. The artifact opens the conversation; the conversation gets you the headcount, the budget, and the policy cover. The artifact is the job.",
      },
    ],
    self_check: [
      {
        question:
          "Why are the won't-ship items as important as the will-ship items in an AI strategy?",
        answer:
          "Because they signal that the strategy is governed, not opportunistic — which is what gets you adoption from Risk, Compliance, and Legal. The won'ts are the political cover for the wills.",
      },
      {
        question:
          "What single document do you ask the VP to approve to make everything else easier?",
        answer:
          "A one-page AI Policy (the won'ts, plus the role of an AI Governance Partner). With it, every individual feature debate becomes a check-against-policy; without it, every feature is litigated from scratch.",
      },
    ],
    leadership_talking_points: [
      "Lead with frontiers, not lists; lists invite litigation, frontiers invite alignment.",
      "Name the won'ts; they earn you the wills.",
      "Tie hiring to named roles per capability; resist generic 'AI engineer' headcount asks.",
      "Run every vendor decision through a public scorecard; politics decline when criteria are visible.",
    ],
  },
];

export const TOTAL_MODULES = MODULES.length;
