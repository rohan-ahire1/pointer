import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";

/** Brute force: try every speed from 1 up and return the first that finishes in time. */
const slowest = (piles: number[], h: number) => {
  for (let k = 1; ; k++) if (piles.reduce((sum, p) => sum + Math.ceil(p / k), 0) <= h) return k;
};

const answer = (raw: string) => {
  const steps = trace(mustParse(parseInput, raw));
  return steps[steps.length - 1].state.answer;
};

describe("koko-eating-bananas", () => {
  it("matches the worked examples", () => {
    expect(answer("3 6 7 11 | 8")).toBe(4);
    expect(answer("30 11 23 4 20 | 5")).toBe(30);
    expect(answer("30 11 23 4 20 | 6")).toBe(23);
  });

  it("every preset is well formed and fits the step budget", () => {
    for (const preset of meta.presets) {
      const steps = trace(mustParse(parseInput, preset));
      expectWellFormed(steps, code, 60);
      for (const step of steps) expect(step.lines.some((line) => python.lines[line] >= 0)).toBe(true);
    }
  });

  it("matches trying every speed on 300 random inputs", () => {
    const int = seeded(20260875);
    for (let n = 0; n < 300; n++) {
      const piles = Array.from({ length: int(1, 6) }, () => int(1, 30));
      const h = int(piles.length, 40);
      const steps = trace({ piles, h });
      expectWellFormed(steps, code, 60);
      const want = slowest(piles, h);
      expect(steps[steps.length - 1].state.answer).toBe(want);
      // the answer never leaves the live range
      for (const step of steps) {
        expect(step.state.lo).toBeLessThanOrEqual(want);
        expect(step.state.hi).toBeGreaterThanOrEqual(want);
      }
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("3 6 7")).toHaveProperty("error");
    expect(parseInput("3 6 7 | 2")).toHaveProperty("error");
    expect(parseInput("31 | 4")).toHaveProperty("error");
    expect(parseInput("3 6 | 4 5")).toHaveProperty("error");
  });
});
