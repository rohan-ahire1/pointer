import { describe, expect, it } from "vitest";
import { getPattern } from "@/content";
import type { Progress } from "@/lib/progress";
import { isPatternStarted, solvedCountForPattern } from "./pattern-progress";

const EMPTY: Progress = { version: 1, solved: {}, lessons: {} };
const slidingWindow = getPattern("sliding-window")!;
const stack = getPattern("stack")!;

describe("isPatternStarted", () => {
  it("is false with no progress at all", () => {
    expect(isPatternStarted(slidingWindow, EMPTY)).toBe(false);
  });

  it("is true when the lesson has a recorded section", () => {
    const progress: Progress = {
      ...EMPTY,
      lessons: { "sliding-window": { lastSection: "idea", updatedAt: "2026-01-01T00:00:00.000Z" } },
    };
    expect(isPatternStarted(slidingWindow, progress)).toBe(true);
  });

  it("is true when any of the pattern's problems is solved, even with no lesson entry", () => {
    const progress: Progress = { ...EMPTY, solved: { "best-time-to-buy-and-sell-stock": true } };
    expect(isPatternStarted(slidingWindow, progress)).toBe(true);
  });

  it("is false when a solved problem belongs to a different pattern", () => {
    const progress: Progress = { ...EMPTY, solved: { "best-time-to-buy-and-sell-stock": true } };
    expect(isPatternStarted(stack, progress)).toBe(false);
  });
});

describe("solvedCountForPattern", () => {
  it("counts solved problems out of the pattern's total", () => {
    const progress: Progress = { ...EMPTY, solved: { "best-time-to-buy-and-sell-stock": true } };
    const result = solvedCountForPattern(slidingWindow, progress);
    expect(result.done).toBe(1);
    expect(result.total).toBe(4);
  });

  it("is 0 done when nothing is solved", () => {
    expect(solvedCountForPattern(slidingWindow, EMPTY).done).toBe(0);
  });
});
