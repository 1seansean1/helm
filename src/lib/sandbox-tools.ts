// Mock harness tools for Sandbox.
// Each tool returns a deterministic, banking-flavoured fake response. The point
// is to let her demonstrate the tool-use LOOP — model calls a tool, harness runs
// it, response goes back, model continues — without standing up real services.

import type { ToolDef } from "./providers";

export interface SandboxTool {
  def: ToolDef;
  execute: (input: any) => Promise<string>;
}

const FAKE_TX = (txId: string, opts: Partial<{ amount: number; merchant: string; date: string }> = {}) => ({
  transaction_id: txId,
  amount_usd: opts.amount ?? 42.0,
  merchant: opts.merchant ?? "GLOW FITNESS LLC",
  merchant_category: "Health Clubs",
  posted_at: opts.date ?? "2026-03-14T08:11:42Z",
  channel: "card_present:false",
  network: "Visa",
  status: "posted",
  mcc: "7997",
});

export const SANDBOX_TOOLS: SandboxTool[] = [
  {
    def: {
      name: "get_transaction",
      description:
        "Look up a single credit-card transaction by transaction id. Returns posted amount, merchant, MCC, channel, and status.",
      input_schema: {
        type: "object",
        properties: { transaction_id: { type: "string", description: "Internal transaction id, e.g. TXN-0001234." } },
        required: ["transaction_id"],
      },
    },
    async execute(input) {
      const id = String(input?.transaction_id ?? "TXN-UNKNOWN");
      return JSON.stringify(FAKE_TX(id), null, 2);
    },
  },
  {
    def: {
      name: "get_customer_history",
      description: "Return the customer's last N days of activity at the given merchant (or all merchants if omitted).",
      input_schema: {
        type: "object",
        properties: {
          customer_id: { type: "string" },
          merchant: { type: "string", description: "Optional merchant filter." },
          days: { type: "integer", default: 90 },
        },
        required: ["customer_id"],
      },
    },
    async execute(input) {
      const days = input?.days ?? 90;
      const m = input?.merchant ?? "GLOW FITNESS LLC";
      return JSON.stringify(
        {
          customer_id: input?.customer_id ?? "CUST-9912",
          window_days: days,
          merchant_filter: m,
          activity: [
            FAKE_TX("TXN-0001234", { amount: 42.0, merchant: m, date: "2026-03-14T08:11:42Z" }),
            FAKE_TX("TXN-0011099", { amount: 42.0, merchant: m, date: "2026-02-14T08:09:12Z" }),
            FAKE_TX("TXN-0008455", { amount: 42.0, merchant: m, date: "2026-01-14T08:14:33Z" }),
            FAKE_TX("TXN-0005521", { amount: 42.0, merchant: m, date: "2025-12-14T08:07:51Z" }),
          ],
          note: "Recurring monthly charge pattern detected (4 of 4 months on the 14th).",
        },
        null,
        2,
      );
    },
  },
  {
    def: {
      name: "search_similar_cases",
      description:
        "Search the disputes case database for cases with the same merchant + reason code. Returns 3-5 closest matches.",
      input_schema: {
        type: "object",
        properties: { merchant: { type: "string" }, reason_code: { type: "string" } },
        required: ["merchant", "reason_code"],
      },
    },
    async execute(input) {
      return JSON.stringify(
        {
          merchant: input?.merchant ?? "GLOW FITNESS LLC",
          reason_code: input?.reason_code ?? "recurring-not-canceled",
          matches: [
            { case_id: "CASE-44012", disposition: "provisional_credit_issued", days_open: 2 },
            { case_id: "CASE-43881", disposition: "provisional_credit_issued", days_open: 1 },
            { case_id: "CASE-43560", disposition: "merchant_notified_pending", days_open: 7 },
          ],
          summary: "All 3 priors received provisional credit within 48h; merchant has a known pattern.",
        },
        null,
        2,
      );
    },
  },
  {
    def: {
      name: "create_provisional_credit",
      description:
        "Issue a provisional credit on the disputed transaction. Refuses for amounts > $25,000 or unverified identity.",
      input_schema: {
        type: "object",
        properties: {
          case_id: { type: "string" },
          amount_usd: { type: "number" },
          reason_code: { type: "string" },
        },
        required: ["case_id", "amount_usd", "reason_code"],
      },
    },
    async execute(input) {
      const amt = Number(input?.amount_usd ?? 0);
      if (amt > 25000) {
        return JSON.stringify({ status: "refused", reason: "amount_above_25k_routes_to_fraud_team" });
      }
      return JSON.stringify({
        status: "issued",
        case_id: input?.case_id ?? "CASE-NEW",
        amount_usd: amt,
        reason_code: input?.reason_code ?? "unspecified",
        posted_at: new Date().toISOString(),
        note: "Customer will see the credit within 1 business day; reversible if review denies.",
      });
    },
  },
  {
    def: {
      name: "escalate_to_human",
      description: "Route the case to a human reviewer queue with a summary.",
      input_schema: {
        type: "object",
        properties: {
          case_summary: { type: "string" },
          urgency: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: ["case_summary"],
      },
    },
    async execute(input) {
      return JSON.stringify({
        status: "queued",
        queue: input?.urgency === "high" ? "senior_reviewer_urgent" : "senior_reviewer_standard",
        sla_hours: input?.urgency === "high" ? 1 : 4,
        ticket_id: "TKT-" + Math.floor(Math.random() * 1e6).toString().padStart(6, "0"),
      });
    },
  },
];

export const TOOLS_BY_NAME = Object.fromEntries(SANDBOX_TOOLS.map((t) => [t.def.name, t]));

export function toolDefs(activeNames: string[]): ToolDef[] {
  return SANDBOX_TOOLS.filter((t) => activeNames.includes(t.def.name)).map((t) => t.def);
}
