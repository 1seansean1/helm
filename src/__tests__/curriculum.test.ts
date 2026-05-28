import { describe, expect, it } from "vitest";
import { MODULES } from "../curriculum";

const EXPECTED_TITLES = [
  "Model selection",
  "Sampling",
  "Harness development",
  "Context files",
  "Skills",
  "Chaining skills into workflows",
  "Automating workflows into routines",
  "Consolidating results",
  "Extracting results",
  "Summarizing results",
  "Leadership guidance to a product team",
];

describe("curriculum invariants (req-set R-01..R-04, R-13)", () => {
  it("has exactly eleven modules in the documented order", () => {
    expect(MODULES.map((m) => m.title)).toEqual(EXPECTED_TITLES);
  });

  it("module numbers are 1..11, monotonic", () => {
    expect(MODULES.map((m) => m.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("module ids are unique kebab-case", () => {
    const ids = MODULES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*[a-z0-9]$/);
    }
  });

  for (const m of EXPECTED_TITLES) {
    it(`"${m}" has a non-empty banking_scenario [R-02]`, () => {
      const mod = MODULES.find((x) => x.title === m)!;
      expect(mod.banking_scenario.setup.length).toBeGreaterThan(40);
      expect(mod.banking_scenario.question.length).toBeGreaterThan(20);
      expect(mod.banking_scenario.why_it_matters.length).toBeGreaterThan(20);
    });

    it(`"${m}" has ≥4 vocabulary entries with banking examples [R-03]`, () => {
      const mod = MODULES.find((x) => x.title === m)!;
      expect(mod.vocabulary.length).toBeGreaterThanOrEqual(4);
      for (const v of mod.vocabulary) {
        expect(v.term.trim().length).toBeGreaterThan(0);
        expect(v.definition.trim().length).toBeGreaterThan(10);
        expect(v.banking_example.trim().length).toBeGreaterThan(10);
      }
    });

    it(`"${m}" has ≥1 exercise with simulated fallback [R-04, R-13]`, () => {
      const mod = MODULES.find((x) => x.title === m)!;
      expect(mod.exercises.length).toBeGreaterThanOrEqual(1);
      for (const ex of mod.exercises) {
        expect(ex.default_system.length).toBeGreaterThan(20);
        expect(ex.default_user.length).toBeGreaterThan(20);
        expect(ex.simulated_response.length).toBeGreaterThan(40);
        expect(ex.leadership_takeaway.length).toBeGreaterThan(20);
      }
    });

    it(`"${m}" has self-check + leadership talking points`, () => {
      const mod = MODULES.find((x) => x.title === m)!;
      expect(mod.self_check.length).toBeGreaterThanOrEqual(2);
      expect(mod.leadership_talking_points.length).toBeGreaterThanOrEqual(2);
    });
  }
});
