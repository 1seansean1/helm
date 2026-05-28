import { describe, expect, it } from "vitest";
import { POCKET, POCKET_BY_CATEGORY } from "../pocket";
import { MODULES } from "../curriculum";

describe("Pocket invariants", () => {
  it("has at least 25 cards", () => {
    expect(POCKET.length).toBeGreaterThanOrEqual(25);
  });

  it("partitions cleanly into the three categories", () => {
    const sum =
      POCKET_BY_CATEGORY.soundbite.length +
      POCKET_BY_CATEGORY.template.length +
      POCKET_BY_CATEGORY.framework.length;
    expect(sum).toBe(POCKET.length);
  });

  it("has at least one soundbite per curriculum module + an interview pitch", () => {
    const sbModules = new Set(
      POCKET_BY_CATEGORY.soundbite.map((c) => c.moduleId).filter(Boolean),
    );
    for (const m of MODULES) {
      expect(sbModules.has(m.id), `missing soundbite for ${m.id}`).toBe(true);
    }
    const hasPitch = POCKET_BY_CATEGORY.soundbite.some((c) => c.id === "sb-interview-pitch");
    expect(hasPitch).toBe(true);
  });

  it("has the AI Policy v2 template + the Acme disputes brief", () => {
    expect(POCKET.some((c) => c.id === "tpl-ai-policy-v2")).toBe(true);
    expect(POCKET.some((c) => c.id === "tpl-acme-disputes-brief")).toBe(true);
  });

  it("every card has substantive body + useWhen + size", () => {
    for (const c of POCKET) {
      expect(c.title.length, c.id).toBeGreaterThan(8);
      expect(c.useWhen.length, c.id).toBeGreaterThan(20);
      expect(c.body.length, c.id).toBeGreaterThan(40);
      expect(c.size, c.id).toMatch(/words/);
    }
  });

  it("card ids are unique", () => {
    const ids = POCKET.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("framework cards have a frontier framing, eleven-capability scaffold, build/buy/partner, hiring profile, sampling, observability", () => {
    const ids = new Set(POCKET_BY_CATEGORY.framework.map((c) => c.id));
    expect(ids.has("fw-eleven-capability-scaffold")).toBe(true);
    expect(ids.has("fw-capability-risk-frontier")).toBe(true);
    expect(ids.has("fw-build-buy-partner")).toBe(true);
    expect(ids.has("fw-hiring-profile-five-roles")).toBe(true);
    expect(ids.has("fw-two-regime-sampling")).toBe(true);
    expect(ids.has("fw-observability-minimum")).toBe(true);
  });
});
