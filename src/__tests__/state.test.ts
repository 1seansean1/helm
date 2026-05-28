import { describe, expect, it } from "vitest";
import { computeOverall } from "../state";

describe("computeOverall (req-set R-09)", () => {
  it("counts completed / in-progress / not-started against total", () => {
    const out = computeOverall(
      {
        a: { status: "completed", notes: "", exerciseRuns: [] },
        b: { status: "completed", notes: "", exerciseRuns: [] },
        c: { status: "in_progress", notes: "", exerciseRuns: [] },
      },
      11,
    );
    expect(out).toEqual({ completed: 2, inProgress: 1, notStarted: 8, totalModules: 11, percent: 18 });
  });

  it("0% when nothing started", () => {
    expect(computeOverall({}, 11).percent).toBe(0);
  });

  it("100% when all completed", () => {
    const progress = Object.fromEntries(
      Array.from({ length: 11 }, (_, i) => [`m${i}`, { status: "completed" as const, notes: "", exerciseRuns: [] }]),
    );
    expect(computeOverall(progress, 11)).toEqual({
      completed: 11,
      inProgress: 0,
      notStarted: 0,
      totalModules: 11,
      percent: 100,
    });
  });
});
