import { describe, expect, it } from "vitest";
import { WORKED_EXAMPLE } from "../worked-example";
import { MODULES } from "../curriculum";

describe("worked-example invariants", () => {
  it("has exactly 11 steps, one per curriculum module", () => {
    expect(WORKED_EXAMPLE.steps).toHaveLength(11);
    expect(WORKED_EXAMPLE.steps.map((s) => s.number)).toEqual(
      Array.from({ length: 11 }, (_, i) => i + 1),
    );
  });

  it("every step references a real module id", () => {
    const moduleIds = new Set(MODULES.map((m) => m.id));
    for (const s of WORKED_EXAMPLE.steps) {
      expect(moduleIds.has(s.moduleId), `unknown moduleId ${s.moduleId}`).toBe(true);
    }
  });

  it("step capability matches the module title", () => {
    const titleById = new Map(MODULES.map((m) => [m.id, m.title]));
    for (const s of WORKED_EXAMPLE.steps) {
      // Capability label may be a short form; require the title's first word to appear.
      const title = titleById.get(s.moduleId)!;
      const firstWord = title.split(" ")[0].toLowerCase();
      expect(s.capability.toLowerCase()).toContain(firstWord);
    }
  });

  it("every step has substantive content (not placeholder)", () => {
    for (const s of WORKED_EXAMPLE.steps) {
      expect(s.what_you_do.length).toBeGreaterThan(60);
      expect(s.concrete_artifact.length).toBeGreaterThan(100);
      expect(s.soundbite.length).toBeGreaterThan(30);
    }
  });

  it("problem block has setup + ≥4 measured metrics + why-it-matters", () => {
    expect(WORKED_EXAMPLE.problem.setup.length).toBeGreaterThan(80);
    expect(WORKED_EXAMPLE.problem.measured_today.length).toBeGreaterThanOrEqual(4);
    expect(WORKED_EXAMPLE.problem.why_it_matters.length).toBeGreaterThan(50);
  });

  it("ships a consolidated brief, outcomes, and an interview pitch", () => {
    expect(WORKED_EXAMPLE.consolidated_brief.length).toBeGreaterThan(200);
    expect(WORKED_EXAMPLE.outcomes_promised.length).toBeGreaterThanOrEqual(4);
    expect(WORKED_EXAMPLE.interview_pitch.length).toBeGreaterThan(120);
  });
});
